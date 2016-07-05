import "../styles/template.less"

import React from "react";
import ReactDOM from "react-dom";

import 'babel-polyfill';
import {AtlasMenu, AtlasSurface} from "./components/atlas/page_elements.jsx";

let portletMenus =
    [
        {
            id: 'generalPortlets',
            title: 'general',
            menus: [
                {
                    id: 'loginPortlet',
                    title: 'Login',
                    content: 'Already a RIPE Atlas user? Log in with your RIPE NCC Access account.',
                    href: 'https://atlas.ripe.net/login?next=my/',
                    arrow: 'If you already have a login we will take you to your <strong>dashboard</strong>'
                }
            ]
        },
        {
            id: 'applicationPortlets',
            title: 'selected application & tools',
            menus: [
                {
                    id: 'openipmapPortlet',
                    title: 'Openipmap',
                    href: 'https://atlas.ripe.net/openipmap/',
                    content: 'See traceroute on a map with Openipmap'
                },
                {
                    id: 'countryjediPortlet',
                    title: 'IXP Country Jedi',
                    href: 'https://atlas.ripe.net/ixpcountryjedi/',
                    content: 'Does Local data stay local? See it with IXP Country Jedi'
                },
                {
                    id: 'quicklookPortlet',
                    title: 'quicklook',
                    content: 'quicklook asn fan-in (enter as number)',
                    href: 'https://atlas.ripe.net/quicklook/'
                }, {
                    id: 'dnsmonPortlet',
                    title: 'dnsmon',
                    href: 'https://atlas.ripe.net/dnsmon/',
                    content: 'go to dnsmon'
                },
                {
                    id: 'latencymonPortlet',
                    title: 'latencymon',
                    href: 'https://atlas.ripe.net/latencymon/',
                    content: 'go to latencymon'
                },
                {
                    id: 'eyeballtracePortlet',
                    title: 'eyeball trace',
                    href: 'https://atlas.ripe.net/eyeballtrace/',
                    content: 'go to eyeball trace'
                },
                {
                    id: 'adventurePortlet',
                    title: 'adventure',
                    href: 'https://atlas.ripe.net/random/',
                    content: 'Take me on an adventure with a random tool.'
                }
            ]
        },
        {
            id: 'relatedPortlets',
            title: 'documentation and other resources',
            menus: [
                {
                    id: 'labsPortlet',
                    title: 'ripe labs',
                    content: 'Read about atlas and projects using atlas at RIPE Atlas.',
                    href: 'https://labs.ripe.net/'
                },
                {
                    id: 'docsPortlet',
                    title: 'documentation',
                    content: 'All the documentation of RIPE Atlas',
                    href: 'https://atlas.ripe.net/docs/'
                }
            ]
        }
    ];

ReactDOM.render(<div id="external" className="col-md-12"><AtlasMenu portletMenus={portletMenus} /><AtlasSurface /></div>, document.getElementById('content'));
