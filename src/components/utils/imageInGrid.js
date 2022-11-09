import React, { Component } from "react";
import { render } from "react-dom";

class ImageInGrid extends Component{
    element;
    constructor(props){
        super(props);
        const { data } = props.columnInfo.renderer.options;
        const { rowKey } = props;
        this.element = document.createElement("img");
        const env = process.env.REACT_APP_MODE;
        data.forEach(img => {
            if(Number(img.seq) === rowKey){
                this.element.src = img.imageSrc;
                this.element.style.width = "45px";
                this.element.style.height = "45px";
                //this.element.setAttribute("crossorigin", "anonymous");
            }
        })
        render(
            <></>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }

}
export default ImageInGrid;