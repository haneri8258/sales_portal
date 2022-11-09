import React, { Component } from "react";
import { render } from "react-dom";

class ButtonsInGrid extends Component{
    element;
    multiButtons;
    constructor(props){
        super(props);
        this.element = document.createElement("ul");

        const {onButtonClicked, buttons} = props.columnInfo.renderer.options;
        const {grid, rowKey} = props;
        this.multiButtons = document.createElement("div");;
        for(let i = 0; i < buttons.length; i++){
            const button = document.createElement("button");
            button.classList += 'btn btn-sm btn-light';
            button.style.fontSize = "0.5rem";
            button.innerText = buttons[i].name;
            this.multiButtons.append(button);
        }
        
        render(
            <>
                <li>
                    <button className="btn btn-sm text-dark m-0 p-1 border-secondary" style={{"fontSize":"0.5rem", "backgroundColor":"#fff"}} onClick={(e) => onButtonClicked(e, "option", grid, rowKey)}>옵션수정</button>
                </li>
                <li>
                    <button className="btn btn-sm text-dark m-0 p-1 border-secondary" style={{"fontSize":"0.5rem", "backgroundColor":"#fff"}} onClick={(e) => onButtonClicked(e, "property", grid, rowKey)}>속성수정</button>
                </li>
            </>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }    

}
export default ButtonsInGrid;