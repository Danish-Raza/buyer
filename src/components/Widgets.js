import { useState, useRef, Fragment } from "react";
import { useDispatch } from "react-redux";
import  _ from "underscore";
import { changeConfig } from "../actions/appActions";
import Utils from "../Utils";
import Cards from "./Cards";
import Charts from "./Charts/Index";
import FormGroup from "./FormGroup";
import Information from "./Information";
import Overview from "./Overview";
import Table from "./Table/Index";
import Tab from "./Tabs";

function Widgets(props) {
    const { curPage, curValue, appData, config } = props;
    const widgetsWrapper = useRef();
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({})
    const [isEditable, setIsEditable] = useState(false)
    const [draggedItem, setDraggedItem] = useState(null)
    const [tabData, setTabData] = useState(null)
    const defaultComponents = [];

    const orderHandler = (value) => {
        setTabData(value)
    }
    
    let components = config && config._order ? _.keys(Utils.sortOrder(config._order)) : [];

    if( config && config._order && config.check_condition && tabData){
        // let result = Utils.returnSuccessfullObject(config.check_condition, tabData)
        // if(result && result._order){
        //     components =  _.keys(Utils.sortOrder(result._order))
        // }
    }
   
    const handleDrop = ev => {
       let cardWrapper  = document.getElementById(`${draggedItem}`) ? document.getElementById(`${draggedItem}`).querySelector('.card-wrapper-body') : null
        if(cardWrapper) {
           cardWrapper.style["overflow-y"]="auto"
           cardWrapper.style["height"]="320px"
        }
        dispatch(changeConfig({action:"CHANGE_WIDGET_ORDER", widgetsWrapper, ev, draggedItem }));
        setDraggedItem(null);
    }

    const dataFromForm = data => {
        let modData = {...formData, ...data}
        setFormData(modData)
    }

    const handleDrag = (ev) => {
        let cardWrapper  = ev.currentTarget.querySelector('.card-component-wrapper')
        if(cardWrapper) {
           ev.currentTarget.querySelector(".card-wrapper-body").style["overflow-y"]="visible"
           ev.currentTarget.querySelector(".card-wrapper-body").style["height"]="auto"
        }
        setDraggedItem(ev.currentTarget.id);
    }

    const toggleIsEditable = () => {
        setIsEditable(!isEditable);

    }
    if(isEditable) {
        let originalOrder = config && config.original_order ? _.keys(Utils.sortOrder(config.original_order)) : [];
        _.map(originalOrder, o => {
            let i = _.findIndex(components, c => config[c].parent_id == config[o].id);
            if( i==-1 ) {
                defaultComponents.push(o);
            }
        })
    } 
    let combinedComponent = [...components, ...defaultComponents];
    
    return (
        <div
            className="widgets-wrapper"  
            ref={widgetsWrapper}
            onDragOver={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
        >
            {
                _.map(combinedComponent, (component, componentIndex) => {
                    let type = config[component].type;
                    let propertyDependsOn = config[component].property_depends_on;
                    let showComponent = true
                    let componentKey = config[component].id + "-" + JSON.stringify(appData.appParams)
                    let dependentData = {}
                    if(props.dependentData) {
                        dependentData = { ...props.dependentData }
                        componentKey = componentKey + "-" + JSON.stringify(dependentData);
                    }
                    if(propertyDependsOn) {
                        if(formData[propertyDependsOn]) {
                            showComponent=true;
                            componentKey = componentKey + "-" + JSON.stringify(formData[propertyDependsOn]);
                            dependentData = { ...dependentData, ...formData[propertyDependsOn]}
                        } else {
                            if(config[component].render_initial) {
                                showComponent = true;
                            } else {
                                showComponent = false;
                            }
                        }
                    }

                    let commonProps = {
                        key: componentKey,
                        id: component.id || component,
                        componentDontExist: !components.includes(component) ? true : false,
                        isEditable: components.includes(component) ? isEditable : false,
                        config: config[component],
                        handleDrop: handleDrop,
                        handleDrag: handleDrag,
                        componentIndex: componentIndex,
                        dependentData: dependentData,
                    }

                    switch (type) {
                        case "overview":
                            delete commonProps.key
                            return showComponent && <Overview {...commonProps} toggleIsEditable={toggleIsEditable} />
                        case "card":
                            return showComponent && 
                            <WidgetWrapper commonProps={commonProps}>
                                <Cards {...commonProps} />
                            </WidgetWrapper>
                        case "chart":
                            return showComponent &&
                            <WidgetWrapper commonProps={commonProps}>
                                <Charts {...commonProps} />
                            </WidgetWrapper>
                        case "table":
                            return showComponent &&
                            <WidgetWrapper commonProps={commonProps}>
                                <Table 
                                    {...commonProps}
                                    tabData={config[component].tabs ? tabData : null} 
                                    tabs = {
                                        config[component].tabs && 
                                        <Tab {...{
                                            key: config[component].id,
                                            id: config[component].id || component,
                                            componentDontExist: !components.includes(component) ? true : false,
                                            isEditable: components.includes(component) ? isEditable : false,
                                            config: config[component].tabs,
                                            componentIndex: componentIndex,
                                            dependentData: dependentData
                                        }} orderHandler={orderHandler}  activeTab={tabData ? tabData.tab  : null} />
                                    }
                                />
                            </WidgetWrapper>
                        case "form-group":
                            return showComponent &&
                            <WidgetWrapper commonProps={commonProps}>
                               <FormGroup {...commonProps} onSubmit={dataFromForm} />
                            </WidgetWrapper> 
                        case "tab":
                            return showComponent && 
                            <WidgetWrapper commonProps={commonProps}>
                                <Tab {...commonProps} orderHandler={orderHandler}  activeTab={tabData ? tabData.tab  : null} />
                            </WidgetWrapper> 
                        case "info":
                            return showComponent &&
                            <WidgetWrapper commonProps={commonProps}>
                                <Information {...commonProps} />
                            </WidgetWrapper> 
                        default:
                            break;
                    }
                })
            }
        </div>
    )
}
function WidgetWrapper(props) {
    const dispatch = useDispatch()
    return (
        <div  
            id={props.commonProps.config.id}
            style={{position:"relative" ,width: props.commonProps.config.width || "100%"}}
            draggable={props.commonProps.isEditable}
            onDrop={props.commonProps.handleDrop} 
            onDragStart={props.commonProps.handleDrag}
            onDragOver={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
        >
            {props.children}
            {props.commonProps.componentDontExist && <div className="add-back-button" onClick={() => dispatch(changeConfig({action:"ADD_WIDGET",index: props.commonProps.componentIndex , id: props.commonProps.config.id}))}>+</div>}
        </div>  
    )
}
export default Widgets