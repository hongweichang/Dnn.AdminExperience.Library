import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {pageHierarchyManager} from "./pages.pageHierarchy";
import util from "../../utils";
import pagesResx from "./pagesResx";
import "./css/pages-hierarchy.css";

class PageHierarchy extends Component {
    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        pageHierarchyManager.resx = pagesResx;
        pageHierarchyManager.utility = util.utilities;
        pageHierarchyManager._viewModel = {};
        pageHierarchyManager.callPageSettings = this.callPageSettings.bind(this);
        pageHierarchyManager.init(this.node, this.initCallback.bind(this));
        pageHierarchyManager.setItemTemplate(this.props.itemTemplate);
        pageHierarchyManager.setSearchKeyword(this.props.searchKeyword);        
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.itemTemplate !== nextProps.itemTemplate) {
            pageHierarchyManager.setItemTemplate(nextProps.itemTemplate);
        }    

        if (this.props.searchKeyword !== nextProps.searchKeyword) {
            pageHierarchyManager.setSearchKeyword(nextProps.searchKeyword);
        }    
    }
    
    initCallback() {
    }

    callPageSettings(action, params) {
        const pageId = params[0];
        this.props.onPageSettings(pageId);
    }
    
    render() {
        const html = require("html!./pages.html");
        return <div dangerouslySetInnerHTML={{__html: html}} />; // eslint-disable-line react/no-danger
    }
} 

PageHierarchy.propTypes = {
    itemTemplate: PropTypes.string.isRequired,
    searchKeyword: PropTypes.string.isRequired,
    onPageSettings: PropTypes.func.isRequired
};

PageHierarchy.defaultProps = {
    itemTemplate: "pages-list-item-template"
};

export default PageHierarchy; 