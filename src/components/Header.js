import DropDown from "./Charts/DropDown";
import _ from "underscore"
import { useDispatch } from "react-redux";
import { changeConfig } from "../actions/appActions";
import { Button, Modal, Popover } from 'antd';
import { useRef, useState } from 'react';
import Icon from "../Icon";
import FormComponent from "./Form/FormComponent";

function Header(props) {
    const { config, isEditable, componentIndex, onChange=()=>{}, selectedOption, columnSelectorComponent,filterSelectorComponent, magnifiedContent, parentComponentData, confirmationStatus, downloadElement } = props;
    const { title, dropdown, display } = config;
    const dispatch = useDispatch()
    const [searchBar, setSearchBar] = useState(false)
    let headerConfig = config.header_config;
    let widgetTitle = title || display;
    const modalComponent  = useRef()

    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleOk = () => {
      setIsModalVisible(false);
    };
  
    const handleCancel = (e) => {
        setIsModalVisible(false);
        if(!e.target.classList.contains('ant-modal-close-x')) {
          
        }
    };

    const toggleSearchBar = () => {
        setSearchBar(!searchBar)
    }

    if(headerConfig) {
        if(headerConfig.template == "dropdown-title" && selectedOption) {
            widgetTitle=''
            if(typeof selectedOption[dropdown.key] == "object" && selectedOption[dropdown.key].length) {
             
               _.map(selectedOption[dropdown.key], (o, i) => widgetTitle += (i != 0 ? " - " : "") + o)
            } else if(typeof selectedOption[dropdown.key] == "string") {
                widgetTitle = selectedOption[dropdown.key]
            }
           
        }
    }
    return (
        <div className="widget-header" ref={modalComponent} >
            <div className="widget-title">
                {widgetTitle}
                {props.tabs}
                {config.change_status_config && config.change_status_config.position  == "left" &&  <div className="change-status-wrapper"> <DropDown allowClear={false} parentComponentData={parentComponentData}  changeStatus={true}  config={config.change_status_config.dropdown} onChange={onChange} styles={{marginLeft: 9}} /> </div>}
            </div>
           
            <div style={{display:"flex", alignItems:"center"}}>
                {config.change_status_config && config.change_status_config.position  == "right" && <div className="change-status-wrapper"> <DropDown allowClear={false} parentComponentData={parentComponentData}  changeStatus={true}  config={config.change_status_config.dropdown} onChange={onChange} styles={{marginLeft: 9}} /></div>}
                {config.searchConfig && 
                <div style={{position:"relative"}}>
                    {searchBar && <FormComponent config={config.searchConfig} />}
                    <Icon type="search" width={15} height={15} styles={{position:"relative", top: -2, marginRight: 9}} onClick={toggleSearchBar}/>
                </div>}
                {config.type == "table" && filterSelectorComponent}
                {config.type == "table" && columnSelectorComponent}
                {magnifiedContent && <Icon type="zoomIn" width={20} height={20} onClick={showModal}/>}
                {
                config.download && 
                    <Popover 
                        getPopupContainer={() => document.body}
                        content={
                            downloadElement ? (
                                downloadElement
                            ) : (
                                <div className="download-popover">
                                    <div className="title">Download Report</div>
                                    <div className="option">PDF</div>
                                    <div className="option">CSV</div>
                                </div>
                            )
                        }  
                        trigger="click" placement="bottomRight"
                    >
                        <Icon type="cloud-download" width={20} height={20}/>
                    </Popover>
                }
                {dropdown !== undefined &&  <DropDown confirmationStatus={confirmationStatus} allowClear={false}  parentComponentData={parentComponentData} config={dropdown} onChange={onChange} styles={{marginLeft: 9}} />}
            </div>
            {isEditable  ? <div className="remove-button" onClick={()=> dispatch(changeConfig({action:"REMOVE_WIDGET", id: props._id || config.id}))}>-</div>:""}
            {isEditable && config.replicate && <div className="replicate-button" onClick={()=> dispatch(changeConfig({action:"REPLICATE_WIDGET",component: config, index: componentIndex})) }>+</div>}
            <Modal getContainer={() => document.body} className="magnify-popup" style={{top: 20 }} title={false} visible={isModalVisible} onOk={handleOk} cancelButtonProps={{style: {display:"none"}}} okText={<Icon type="zoomOut" width={20} height={20} styles={{marginLeft:0, left: -2, top: 1}}/>} onCancel={handleCancel}>
               {magnifiedContent}
            </Modal>
        </div>
    )
}
export default Header;