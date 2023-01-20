import * as React from "react";
import { Button, Checkbox, Input } from "./components/form";
import db from "./db";
import { Driver } from "neo4j-driver";
import logo from "./assets/logo.png";
import { ILoginData } from "./utils/interfaces";

interface ILoginState {
    url: string;
    username: string;
    password: string;
    remember: boolean;
    submitted: boolean;
    error: string | null;
}

/**
 * Login page
 * @todo add additional info
 */
class Login extends React.Component<{ handleLogin: () => void }, ILoginState> {
    state: ILoginState = {
        url: localStorage.getItem("host") || "bolt://localhost:7687",
        username: "",
        password: "",
        remember: false,
        submitted: false,
        error: null,
    };

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ submitted: true });

        this.tryConnect(this.state.url, this.state.username, this.state.password, err => {
            this.setState({
                submitted: false,
                error: err,
            });
        });
    };

    tryConnect = (url: string, username: string, password: string, onError: (error: string) => void) => {
        let driver: Driver;
        try {
            driver = db.neo4j.driver(url, username.length > 0 && password.length > 0 ? db.neo4j.auth.basic(username, password) : { scheme: "none", principal: "", credentials: "" }, {
                userAgent: "stefanak-michal/cypherGUI",
            });
        } catch (err) {
            onError("[" + err.name + "] " + err.message);
            return;
        }

        driver
            .session({ defaultAccessMode: db.neo4j.session.WRITE })
            .run("CREATE (n) DELETE n RETURN n")
            .then(response => {
                if (response.records.length) {
                    db.setDriver(driver, err => {
                        if (err) {
                            onError("[" + err.name + "] " + err.message);
                        } else {
                            db.hasElementId = "elementId" in response.records[0].get("n");
                            localStorage.setItem("host", url);
                            if (this.state.remember) localStorage.setItem("login", JSON.stringify({ username: username, password: password }));

                            this.props.handleLogin();
                        }
                    });
                } else {
                    onError("Initial test query wasn't successful");
                }
            })
            .catch(err => {
                onError("[" + err.name + "] " + err.message);
            });
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const target = e.currentTarget;
        const value = e.currentTarget.type === "checkbox" ? target.checked : target.value;
        const name = target.name;

        let obj = {};
        obj[name] = value;
        this.setState(obj);
    };

    componentDidMount() {
        let login = localStorage.getItem("login");
        if (login) {
            try {
                let parsed = JSON.parse(login);
                this.tryConnect(this.state.url, parsed.username, parsed.password, () => {
                    localStorage.removeItem("login");
                });
            } catch (Error) {}
        }
    }

    render() {
        document.title = "Login / cypherGUI";
        return (
            <section className="mt-5 container is-fluid">
                <div className="columns">
                    <div className="column is-one-third is-offset-one-third">
                        <h1 className="has-text-centered">
                            <img src={logo} alt="cypherGUI" />
                        </h1>
                    </div>
                </div>

                <form id="login" className="columns mt-6" onSubmit={this.handleSubmit}>
                    <div className="column is-one-third is-offset-one-third box">
                        <Input label="URL" name="url" onChange={this.handleInputChange} value={this.state.url} />
                        <Input label="Username" name="username" onChange={this.handleInputChange} value={this.state.username} focus={true} />
                        <Input label="Password" name="password" type="password" onChange={this.handleInputChange} />
                        <Checkbox
                            name="remember"
                            label="Remember (not secure)"
                            checked={this.state.remember}
                            color="is-primary"
                            onChange={() =>
                                this.setState(state => {
                                    return { remember: !state.remember };
                                })
                            }
                        />
                        {this.state.error && <div className="notification is-danger">{this.state.error}</div>}
                        <Button text="Login" icon="fa-solid fa-check" color={"mt-3 is-primary " + (this.state.submitted ? "is-loading" : "")} type="submit" />
                    </div>
                </form>
            </section>
        );
    }
}

export default Login;
