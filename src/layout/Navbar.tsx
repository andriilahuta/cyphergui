import * as React from "react";
import { neo4j, setActiveDb, disconnect, getDriver, getActiveDb } from "../db";

interface INavbarProps {
    handleLogout: () => void;
    handleAddQueryTab: () => void;
}

/**
 * Navbar
 * @todo change logo and title
 */
class Navbar extends React.Component<INavbarProps> {
    state = {
        open: false,
        databases: [],
        activeDb: getActiveDb(),
    };

    requestData = () => {
        getDriver()
            .session({ defaultAccessMode: neo4j.session.READ })
            .run("SHOW DATABASES")
            .then(response => {
                const defaultDb = response.records.filter(row => row.get("default"))[0].get("name");
                const databases = response.records.filter(row => row.get("type") !== "system").map(row => row.get("name"));
                if (this.state.activeDb === null || databases.indexOf(this.state.activeDb) === -1) {
                    this.handleChangeDb(defaultDb);
                }
                this.setState({
                    databases: databases,
                });
            })
            .catch(() => {
                this.setState({ databases: null });
            });
    };

    componentDidMount() {
        this.requestData();
    }

    componentWillUnmount() {
        this.setState({
            databases: null,
        });
    }

    handleOpen = () => {
        this.setState({
            open: !this.state.open,
        });
    };

    handleLogout = () => {
        disconnect();
        this.props.handleLogout();
    };

    handleChangeDb = (name: string) => {
        setActiveDb(name);
        this.setState({
            activeDb: name,
        });
    };

    render() {
        return (
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <span className="navbar-item icon-text is-size-3">
                        <span className="icon is-large">
                            <i className="fa-solid fa-cloud-bolt "></i>
                        </span>
                        <span>BOLT ADMIN</span>
                    </span>

                    <a
                        href="#"
                        role="button"
                        className={"navbar-burger " + (this.state.open ? "is-active" : "")}
                        aria-label="menu"
                        aria-expanded="false"
                        data-target="basicNavbar"
                        onClick={this.handleOpen}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="basicNavbar" className={"navbar-menu " + (this.state.open ? "is-active" : "")}>
                    <div className="navbar-start"></div>
                    <div className="navbar-end">
                        {this.state.databases !== null && this.state.databases.length > 1 && (
                            <div className="navbar-item has-dropdown is-hoverable">
                                <span className="navbar-link">DB</span>
                                <div className="navbar-dropdown">
                                    {this.state.databases.map(name => (
                                        <a
                                            href="#"
                                            key={"navbar-item-" + name}
                                            className={(this.state.activeDb === name ? "is-active" : "") + " navbar-item"}
                                            onClick={() => this.handleChangeDb(name)}>
                                            {name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="navbar-item">
                            <div className="buttons">
                                <button className="button is-info" onClick={this.props.handleAddQueryTab}>
                                    <span className="icon">
                                        <i className="fas fa-plus" aria-hidden="true"></i>
                                    </span>
                                    <strong>Query</strong>
                                </button>
                                <button className="button is-light" onClick={this.handleLogout}>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;
