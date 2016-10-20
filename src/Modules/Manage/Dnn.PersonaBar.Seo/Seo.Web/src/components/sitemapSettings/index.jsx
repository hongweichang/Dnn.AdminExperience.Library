import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
    pagination as PaginationActions,
    seo as SeoActions
} from "../../actions";
import InputGroup from "dnn-input-group";
import SingleLineInputWithError from "dnn-single-line-input-with-error";
import Grid from "dnn-grid-system";
import Dropdown from "dnn-dropdown";
import Label from "dnn-label";
import RadioButtons from "dnn-radio-buttons";
import Switch from "dnn-switch";
import Button from "dnn-button";
import ProviderRow from "./providerRow";
import ProviderEditor from "./providerEditor";
import "./style.less";
import util from "../../utils";
import resx from "../../resources";
import styles from "./style.less";

let daysToCacheOptions = [];
let priorityOptions = [];
let tableFields = [];

class SitemapSettingsPanelBody extends Component {
    constructor() {
        super();
        this.state = {
            sitemapSettings: undefined,
            triedToSubmit: false,
            openId: ""
        };
    }

    componentWillMount() {
        const {state, props} = this;
        if (props.sitemapSettings) {
            this.setState({
                sitemapSettings: props.sitemapSettings
            });
            return;
        }

        daysToCacheOptions = [];
        daysToCacheOptions.push({ "value": 0, "label": resx.get("DisableCaching") });
        daysToCacheOptions.push({ "value": 1, "label": resx.get("1Day") });
        daysToCacheOptions.push({ "value": 2, "label": resx.get("2Days") });
        daysToCacheOptions.push({ "value": 3, "label": resx.get("3Days") });
        daysToCacheOptions.push({ "value": 4, "label": resx.get("4Days") });
        daysToCacheOptions.push({ "value": 5, "label": resx.get("5Days") });
        daysToCacheOptions.push({ "value": 6, "label": resx.get("6Days") });
        daysToCacheOptions.push({ "value": 7, "label": resx.get("7Days") });

        priorityOptions = [];
        priorityOptions.push({ "value": 1, "label": "1" });
        priorityOptions.push({ "value": 0.9, "label": "0.9" });
        priorityOptions.push({ "value": 0.8, "label": "0.8" });
        priorityOptions.push({ "value": 0.7, "label": "0.7" });
        priorityOptions.push({ "value": 0.6, "label": "0.6" });
        priorityOptions.push({ "value": 0.5, "label": "0.5" });
        priorityOptions.push({ "value": 0.4, "label": "0.4" });
        priorityOptions.push({ "value": 0.3, "label": "0.3" });
        priorityOptions.push({ "value": 0.2, "label": "0.2" });
        priorityOptions.push({ "value": 0.1, "label": "0.1" });
        priorityOptions.push({ "value": 0, "label": "0" });

        tableFields = [];
        tableFields.push({ "name": resx.get("Name.Header"), "id": "Name" });
        tableFields.push({ "name": resx.get("Enabled.Header"), "id": "Enabled" });
        tableFields.push({ "name": resx.get("Priority.Header"), "id": "Priority" });

        props.dispatch(SeoActions.getSitemapSettings((data) => {
            this.setState({
                sitemapSettings: Object.assign({}, data.Settings)
            });
        }));

        props.dispatch(SeoActions.getProviders((data) => {
            this.setState({
                providers: Object.assign({}, data.Providers)
            });
        }));
    }

    componentWillReceiveProps(props) {
        let {state} = this;

        this.setState({
            sitemapSettings: Object.assign({}, props.sitemapSettings),
            triedToSubmit: false
        });
    }

    onSettingChange(key, event) {
        let {state, props} = this;
        let sitemapSettings = Object.assign({}, state.sitemapSettings);

        if (key === "SitemapExcludePriority" || key === "SitemapCacheDays" || key === "SitemapMinPriority") {
            sitemapSettings[key] = event.value;
        }
        else {
            sitemapSettings[key] = typeof (event) === "object" ? event.target.value : event;
        }

        this.setState({
            sitemapSettings: sitemapSettings,
            triedToSubmit: false
        });

        props.dispatch(SeoActions.sitemapSettingsClientModified(sitemapSettings));
    }

    keyValuePairsToOptions(keyValuePairs) {
        let options = [];
        if (keyValuePairs !== undefined) {
            options = keyValuePairs.map((item) => {
                return { label: item.Key, value: item.Value };
            });
        }
        return options;
    }

    onUpdate(event) {
        event.preventDefault();
        const {props, state} = this;
        this.setState({
            triedToSubmit: true
        });

        props.dispatch(SeoActions.updateSitemapSettings(state.sitemapSettings, (data) => {
            util.utilities.notify(resx.get("SettingsUpdateSuccess"));
        }, (error) => {
            util.utilities.notifyError(resx.get("SettingsError"));
        }));
    }

    onCancel(event) {
        const {props, state} = this;
        util.utilities.confirm(resx.get("SettingsRestoreWarning"), resx.get("Yes"), resx.get("No"), () => {
            props.dispatch(SeoActions.getSitemapSettings((data) => {
                this.setState({
                    sitemapSettings: Object.assign({}, data.Settings)
                });
            }));
        });
    }

    onClearCache() {
        const {props, state} = this;
        props.dispatch(SeoActions.clearCache());
    }

    onUpdateProvider(settings) {
        const {props, state} = this;

        props.dispatch(SeoActions.updateProvider(settings, (data) => {
            util.utilities.notify(resx.get("SettingsUpdateSuccess"));
            this.collapse();
        }, (error) => {
            util.utilities.notifyError(resx.get("SettingsError"));
        }));
    }

    uncollapse(id) {
        setTimeout(() => {
            this.setState({
                openId: id
            });
        }, this.timeout);
    }
    collapse() {
        if (this.state.openId !== "") {
            this.setState({
                openId: ""
            });
        }
    }
    toggle(openId) {
        if (openId !== "") {
            this.uncollapse(openId);
        } else {
            this.collapse();
        }
    }

    renderHeader() {
        let tableHeaders = tableFields.map((field) => {
            let className = "provider-items header-" + field.id;
            return <div className={className} key={"header-" + field.id}>
                <span>{field.name}</span>
            </div>;
        });
        return <div className="header-row">{tableHeaders}</div>;
    }

    renderedProviders() {
        let i = 0;
        if (this.props.providers) {
            return this.props.providers.map((item, index) => {
                return (
                    <ProviderRow
                        name={item.Name}
                        enabled={item.Enabled}
                        priority={item.Priority}
                        overridePriority={item.OverridePriority}
                        index={index}
                        key={"provider-" + index}
                        closeOnClick={true}
                        openId={this.state.openId}
                        OpenCollapse={this.toggle.bind(this)}
                        Collapse={this.collapse.bind(this)}>
                        <ProviderEditor
                            settings={item}
                            Collapse={this.collapse.bind(this)}
                            onUpdate={this.onUpdateProvider.bind(this)}
                            openId={this.state.openId} />
                    </ProviderRow>
                );
            });
        }
    }

    /* eslint-disable react/no-danger */
    render() {
        const {props, state} = this;
        if (state.sitemapSettings) {
            const columnOne = <div className="left-column">
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("sitemapUrlLabel.Help")}
                        label={resx.get("sitemapUrlLabel")}
                        />
                    <SingleLineInputWithError
                        inputStyle={{ margin: "0" }}
                        withLabel={false}
                        error={false}
                        value={state.sitemapSettings.SitemapUrl}
                        enabled={false}
                        />
                </InputGroup>
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblExcludePriority.Help")}
                        label={resx.get("lblExcludePriority")}
                        />
                    <Dropdown
                        options={priorityOptions}
                        value={state.sitemapSettings.SitemapExcludePriority}
                        onSelect={this.onSettingChange.bind(this, "SitemapExcludePriority")}
                        />
                </InputGroup>
                <InputGroup>
                    <div className="sitemapSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("lblIncludeHidden.Help")}
                            label={resx.get("lblIncludeHidden")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.sitemapSettings.SitemapIncludeHidden}
                            onChange={this.onSettingChange.bind(this, "SitemapIncludeHidden")}
                            />
                    </div>
                </InputGroup>
            </div>;
            const columnTwo = <div className="right-column">
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblCache.Help")}
                        label={resx.get("lblCache")}
                        />
                    <div className="daysToCache">
                        <Dropdown
                            options={daysToCacheOptions}
                            value={state.sitemapSettings.SitemapCacheDays}
                            onSelect={this.onSettingChange.bind(this, "SitemapCacheDays")}
                            />
                        <Button
                            className="clearCacheBtn"
                            type="secondary"
                            onClick={this.onClearCache.bind(this)}>
                            {resx.get("lnkResetCache")}
                        </Button>
                    </div>
                </InputGroup>
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblMinPagePriority.Help")}
                        label={resx.get("lblMinPagePriority")}
                        />
                    <Dropdown
                        options={priorityOptions}
                        value={state.sitemapSettings.SitemapMinPriority}
                        onSelect={this.onSettingChange.bind(this, "SitemapMinPriority")}
                        />
                </InputGroup>
                <InputGroup>
                    <div className="sitemapSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("lblLevelPriority.Help")}
                            label={resx.get("lblLevelPriority")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.sitemapSettings.SitemapLevelMode}
                            onChange={this.onSettingChange.bind(this, "SitemapLevelMode")}
                            />
                    </div>
                </InputGroup>
            </div>;

            return (
                <div className={styles.sitemapSettings}>
                    <div className="columnTitle">{resx.get("SitemapSettings")}</div>
                    <Grid children={[columnOne, columnTwo]} numberOfColumns={2} />
                    <div className="columnTitle2">{resx.get("SitemapProviders")}</div>
                    <div className="provider-items-grid">
                        {this.renderHeader()}
                        {this.renderedProviders()}
                    </div>
                    <div className="buttons-box">
                        <Button
                            disabled={!this.props.clientModified}
                            type="secondary"
                            onClick={this.onCancel.bind(this)}>
                            {resx.get("Cancel")}
                        </Button>
                        <Button
                            disabled={!this.props.clientModified}
                            type="primary"
                            onClick={this.onUpdate.bind(this)}>
                            {resx.get("Save")}
                        </Button>
                    </div>
                </div>
            );
        }
        else return <div />;
    }
}

SitemapSettingsPanelBody.propTypes = {
    dispatch: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    sitemapSettings: PropTypes.object,
    clientModified: PropTypes.bool,
    providers: PropTypes.array
};

function mapStateToProps(state) {
    return {
        tabIndex: state.pagination.tabIndex,
        sitemapSettings: state.seo.sitemapSettings,
        clientModified: state.seo.clientModified,
        providers: state.seo.providers
    };
}

export default connect(mapStateToProps)(SitemapSettingsPanelBody);