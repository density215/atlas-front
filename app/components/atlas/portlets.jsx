import React from 'react';

export class ArrowedText extends React.Component {
    render() {
        return <div className="arrowBox">
            <svg viewBox="0 0 30 30" width="30" height="30">
                <defs>
                    <marker id="arrower" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0 L5,2.5 L0,5 z"></path>
                    </marker>
                </defs>
                <path d="M12,30 C5,20 2,15 12,0" markerEnd="url(#arrower)">
                </path>
            </svg>
            <div class="label" dangerouslySetInnerHTML={{__html: this.props.label}} />
        </div>;
    }
}

export class Portlet extends React.Component {
    render() {
        if (this.props.arrow) {
            var arrow = <ArrowedText label={this.props.arrow}/> || null;
        }
        return (<div className="col-md-6 padding-inner landing-boxes portlet grey grey-border">
            <div className="block_item">
                <div className="header">
                    <a className="h5" href={this.props.href}>{this.props.title}</a>
                </div>
                <div className="block_content">
                    <p>{this.props.content}</p>
                </div>
            </div>
            {arrow}
        </div>);
    }
}

export class PortletMenu extends React.Component {
    render() {
        let pm = this.props.portletMenu;
        return <div id={pm.id} className="portletMenu">
            <h4>{pm.title}</h4>

            { pm.menus.map(function (p) {
                return <Portlet key={p.id} content={p.content} href={p.href} title={p.title} arrow={p.arrow}/>;
            }) }
        </div>
    }
}

export default {Portlet, PortletMenu};
