import React, { Component } from "react";
import { render } from "react-dom";

class ButtonInGrid extends Component{
    element;
    constructor(props){
        super(props);
        this.element = document.createElement("div");

        const {onButtonClicked, buttonType, buttonCss} = props.columnInfo.renderer.options;
        const {grid, rowKey} = props;
        
        render(
            <button type="button" style={{ "width": "-webkit-fill-available" }} onClick={()=>onButtonClicked(grid,rowKey,buttonType)}
                    className={buttonCss}>
                        {buttonType}
            </button>,
            this.element
        )
    }
    getElement() {
        return this.element;
      }    

}
export default ButtonInGrid;