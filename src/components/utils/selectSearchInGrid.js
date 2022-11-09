import React, { Component } from "react";
import { render } from "react-dom";
import SelectSearch, {fuzzySearch} from 'react-select-search';

class SelectSearchInGrid extends Component{
    element;
    value;
    constructor(props){
        super(props);
        this.element = document.createElement("div");
        const { onChangeSelectSearch, data , columnName } = props.columnInfo.editor.options;
        const {grid, rowKey} = props;
        this.value = props.value;
        
        render(
            <SelectSearch className="select-search form-select-sm" options={data} filterOptions={fuzzySearch} 
                onChange={(value, option)=>this.onChangeCategory(value, option, grid, rowKey, onChangeSelectSearch,columnName)} 
                emptyMessage="Not found" placeholder="::카테고리 선택::" search/>,
            this.element
        )
    }
    getElement() {
        return this.element;
    }
    getValue(){
        return this.value;
    }

    onFocus = () => {
        //drop-up을 위함
        //logic 필요
        console.log("focus");
    }

    onChangeCategory = (value, option, grid, rowKey, onChangeSelectSearch,columnName) => {
        if(option.name !== ""){
            this.value = option.name;
            onChangeSelectSearch(grid, rowKey, option, value,columnName);
        }
    }
}
export default SelectSearchInGrid;