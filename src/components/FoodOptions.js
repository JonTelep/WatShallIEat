import React from 'react';

/* export default class SelectBox extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
    this.state = {
      allChecked: false,
      checkedCount: 0,
      options: [
        { value: 'selectAll', text: 'Select All' },
        { value: 'American', text: 'American' },
        { value: 'Asian', text: 'Asian' },
        { value: 'Fastfood', text: 'Fastfood' },
        { value: 'Mexican', text: 'Mexican' },
        { value: 'Indian', text: 'Indian' },
        { value: 'Thai', text: 'Thai' }
      ]
    };
  } */
  class FoodOptions extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        allChecked: true,
        checkedCount: 0,
        isAmerican: true,
        isAsian: false,
        isFastFood: false,
        isMexican: false,
        isIndian: false,
        isThai: false,
        isSushi: false,
        options: props.options
      };

      this.handleInputChange = this.handleInputChange.bind(this);
    }
  
    handleInputChange(event) {

      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
  
      this.setState({
        [name]: value
      });
      console.log(this.state.isAmerican);
      console.log('checked:' + this.state.isAmerican);
    }
    //`ui toggle checkbox ${option.checked ? 'checked': ''}`
    //`ui toggle checkbox ${this.state.isAmerican ? 'checked': ''}`
  
    render() {
      return (
        <form>
            <div className="inline field">
                <div className = {`ui toggle checkbox ${this.state.allChecked ? 'checked': ''}`}>
                        <input
                        name="allChecked"
                        type="checkbox"
                        checked={this.state.allChecked}
                        onChange={this.handleInputChange} />
                        <label>Select/Unselect all </label>
                </div>
                <div className = "{`ui toggle checkbox ${this.state.isAmerican ? 'checked': ''}`}">
                        <input
                        name="isAmerican"
                        type="checkbox"
                        checked={this.state.isAmerican}
                        onChange={this.handleInputChange} 
                        />
                    <label>American</label>
                </div>
            </div>
        </form>
      );
    }
}

export default FoodOptions;