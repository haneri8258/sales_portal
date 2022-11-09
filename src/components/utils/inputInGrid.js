import React, { Component } from "react";
import { render } from "react-dom";

class InputInGrid extends Component{
    element;
    constructor(props){
        super(props);
        this.element = document.createElement("input");

        this.element.type = 'text';
        this.element.classList+="form-control-sm";
        this.element.style.minHeight = "1rem";
        this.element.value = String(props.value);
        render(
            <></>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }
    
    getValue() {
        return this.element.value;
    }

}
export default InputInGrid;