import React, { Component } from "react";
import { render } from "react-dom";

class SelectYnInGrid extends Component{
    element;
    value;
    constructor(props){
        super(props);
        this.element = document.createElement("div");
        const { onChangeSelectYn, columnName } = props.columnInfo.editor.options;
        const {grid, rowKey} = props;
        this.value = props.value;
        render(
            <select className="form-select" style={{"minHeight":"1rem" }} onChange={(e) => this.onChange(e, grid, rowKey, columnName, onChangeSelectYn)} defaultValue={this.value}>
                <option value="Y">Y</option>
                <option value="N">N</option>
            </select>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }
    getValue(){
        return this.value;
    }
    onChange(e, grid, rowKey, columnName, onChangeSelectYn){
        this.value = e.target.value;
        onChangeSelectYn(e, grid, rowKey, columnName);
    }
}
export default SelectYnInGrid;