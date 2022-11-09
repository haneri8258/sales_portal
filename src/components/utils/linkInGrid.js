
import React, { Component } from "react"
import { render } from "react-dom";

class LinkInGrid extends Component{
    element;
    constructor(props){
        super(props);
        this.element = document.createElement("div");

        const {onClickedAtag} = props.columnInfo.renderer.options;
        const {value, rowKey} = props;
        
        render(
                <a href="" className="fw-bold p-2" style={{ "width": "7rem", "textDecoration": "none", "color":"#6610f2" }} onClick={(e)=>onClickedAtag(e, rowKey)}>
                            {value}
                </a>
            ,
            this.element
        )
    }
    getElement() {
        return this.element;
    }    

}
export default LinkInGrid;