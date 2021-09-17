import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';
import styled from '@emotion/styled';

import * as Store from './store/store';
import { MainView } from './main-view';

declare var window: {__store: Store.Store};

const store = new Store.Store();
window.__store = store;

const MainLayout = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    /* grid-template-columns: 1fr; */
    grid-template-areas:
        "header"
        "body";
    height: 100vh;
    overflow: hidden;
`;
const MainMenu = styled.ul`
    grid-area: header;
    background-color: #eee;
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;

    a {
        display: block;
        padding: .5em 1em;

        &:hover {
            background-color: rgba(0, 0, 0, .1);
        }
    }
`;
const Body = styled.div`
    grid-area: body;
    overflow: auto;
`;

const pages = [
    {path: '/', label: 'Main view', Component: MainView},
];

const app = (
    <BrowserRouter>
        <MainLayout>
            <MainMenu>
                {
                    pages.map(page => {
                        return (
                            <li key={page.path}>
                                <NavLink activeStyle={{ fontWeight: 'bold' }} to={page.path}>{page.label}</NavLink>
                            </li>
                        );
                    })
                }
            </MainMenu>

            <Body>
                <Switch>
                    {/* <Route path="/">
                        <MainView store={store} />
                    </Route> */}
                    {
                        pages.map(page => {
                            return (
                                <Route key={page.path} path={page.path}>
                                    <page.Component store={store} />
                                </Route>
                            )
                        })
                    }
                </Switch>
            </Body>
        </MainLayout>
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));