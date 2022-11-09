import React, { Component } from "react";
import { render } from "react-dom";

class IconInGrid extends Component{
    element;
    constructor(props){
        super(props);
        this.element = document.createElement("div");

        let { icon } = props.columnInfo.renderer.options;        
        const { value } = props;        
        if(value !== "Y"){
            icon = "";
        }

        render(            
            <div>{icon}</div>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }    

}
export default IconInGrid;