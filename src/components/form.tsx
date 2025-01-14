import * as React from "react";
import { EPage } from "../utils/enums";
import { ITabManager } from "../utils/interfaces";

export class Input extends React.Component<{ label: string; name: string; type?: string; placeholder?: string; value?: any; onChange: (e: React.ChangeEvent) => void; focus?: boolean }> {
    render() {
        return (
            <div className="field">
                <label className="label">{this.props.label}</label>
                <div className="control">
                    <input
                        className="input"
                        name={this.props.name}
                        type={this.props.type || "text"}
                        placeholder={this.props.placeholder || ""}
                        onChange={this.props.onChange}
                        value={this.props.value}
                        autoFocus={this.props.focus || false}
                    />
                </div>
            </div>
        );
    }
}

export class Checkbox extends React.Component<{ name: string; label: string; color?: string; onChange?: (e: React.ChangeEvent) => void; checked?: boolean; disabled?: boolean; help?: string }> {
    render() {
        return (
            <div className="field">
                <label className={"switch " + (this.props.color || "")}>
                    <input type="checkbox" name={this.props.name} onChange={this.props.onChange} checked={this.props.checked || false} disabled={this.props.disabled || false} />
                    <span className="slider" /> {this.props.label}
                </label>
                {this.props.help && <p className="help">{this.props.help}</p>}
            </div>
        );
    }
}

export class Textarea extends React.Component<
    {
        name: string;
        value: string;
        onChange?: (e: React.ChangeEvent) => void;
        autoresize?: boolean;
        focus?: boolean;
        placeholder?: string;
        color?: string;
        required?: boolean;
        onKeyDown?: (e: React.KeyboardEvent) => void;
        highlight?: object;
    },
    { height: number }
> {
    ref = React.createRef<HTMLTextAreaElement>();
    highlightRef = React.createRef<HTMLDivElement>();
    state = {
        height: 0,
    };

    componentDidMount() {
        this.resize();
        this.highlight();
    }

    componentDidUpdate() {
        this.resize();
        this.highlight();
    }

    resize = () => {
        if (this.props.autoresize !== false) {
            this.ref.current.style.height = "0px";
            const computed = window.getComputedStyle(this.ref.current);
            this.ref.current.style.height = parseInt(computed.getPropertyValue("border-top-width")) + this.ref.current.scrollHeight + parseInt(computed.getPropertyValue("border-bottom-width")) + "px";
        }
    };

    highlight = () => {
        if (this.props.highlight) {
            let text = this.ref.current.value;
            for (let color in this.props.highlight) {
                for (let keyword of this.props.highlight[color]) {
                    text = text.replace(new RegExp("(?<!>)\\b" + keyword + "\\b(?!<)", "gi"), `<mark style="${color[0] === "#" ? "color: " + color : ""};">$&</mark>`);
                }
            }
            this.highlightRef.current.innerHTML = text;
        }
    };

    render() {
        return (
            <>
                {this.props.highlight && (
                    <div className={"highlight-backdrop textarea " + (this.props.color || "")}>
                        <div className="highlights" ref={this.highlightRef}></div>
                    </div>
                )}

                <textarea
                    name={this.props.name}
                    className={"textarea " + (this.props.color || "")}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    ref={this.ref}
                    autoFocus={this.props.focus || false}
                    placeholder={this.props.placeholder}
                    required={this.props.required}
                    onKeyDown={this.props.onKeyDown}
                />
            </>
        );
    }
}

//maybe this should be somewhere else ...it is not really form ..hmm html.tsx?
export class Button extends React.Component<{
    text?: string;
    icon?: string;
    color?: string;
    onClick?: (e?: any) => void;
    type?: "submit" | "reset" | "button";
    title?: string;
    value?: string;
    children?: React.ReactNode;
}> {
    render() {
        return (
            <button className={"button " + (this.props.color || "")} onClick={this.props.onClick} type={this.props.type || "button"} title={this.props.title || ""} value={this.props.value}>
                {this.props.icon && (
                    <span className="icon">
                        <i className={this.props.icon} />
                    </span>
                )}
                {this.props.text && <span>{this.props.text}</span>}
                {this.props.children}
            </button>
        );
    }
}

export class LabelButton extends React.Component<{ label: string; database: string; size?: string; tabManager: ITabManager }> {
    render() {
        return (
            <Button
                color={"tag is-link is-rounded px-2 " + (this.props.size || "")}
                onClick={() => this.props.tabManager.add(this.props.label, "fa-regular fa-circle", EPage.Label, { label: this.props.label, database: this.props.database })}
                text={":" + this.props.label}
            />
        );
    }
}

export class TypeButton extends React.Component<{ type: string; database: string; size?: string; tabManager: ITabManager }> {
    render() {
        return (
            <Button
                color={"tag is-info is-rounded px-2 " + (this.props.size || "")}
                onClick={() => this.props.tabManager.add(this.props.type, "fa-solid fa-arrow-right-long", EPage.Type, { type: this.props.type, database: this.props.database })}
                text={":" + this.props.type}
            />
        );
    }
}
