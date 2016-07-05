/**
 * Created by jdenhertog on 26/05/16.
 */
import React from 'react';

import {PortletMenu} from './portlets.jsx';
import {AtlasMap} from './atlas_map.jsx';

export class AtlasMenu extends React.Component {
    render() {
        let portletMenus = this.props.portletMenus;
        return <div id="atlasMenu" className="col-md-6">
            {portletMenus.map(function (pm) {
                return <PortletMenu key={pm.id} portletMenu={pm}/>;
            })}
        </div>;
    }
}

export class AtlasSurface extends React.Component {

    render() {
        return <div id="atlasSurface" className="col-md-6">
            <AtlasMap scale={1200*5}/>
        </div>;
    }
}
