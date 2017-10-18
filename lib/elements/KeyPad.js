import React, {Component} from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import onClickOutside from 'react-onclickoutside'

import Button from './Button'
import Display from './Display'
import specialKeys from './specialKeys'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin: auto;
    width: 240px;
    height: 100%;
`

const Keys = styled.div`
    display: flex;
    flex: 4;
    flex-wrap: wrap;
    button {
        border-bottom: 1px solid black;
        border-right: 1px solid black;
    }
    button:nth-child(3n + 1) {
        border-left: 1px solid black;
    }
    button:nth-child(-n + 3) {
        border-top: 1px solid black;
    }
`


class KeyPad extends Component {

    constructor(props) {
        super(props)
        this.state = { input: '' }
        this.handleClick = this.handleClick.bind(this)
        this.numericKeyClick = this.numericKeyClick.bind(this)
        this.specialKeyClick = this.specialKeyClick.bind(this)
        this.keyDown = this.keyDown.bind(this)
        this.cancelLastInsert = this.cancelLastInsert.bind(this)        
        this.numericKeys = [...Array(10).keys()]
        this.specialKeys = ['.', '-']
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyDown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown)
    }

    handleClickOutside(evt) {
        evt.preventDefault()
        evt.stopPropagation()        
        this.props.cancel()
    }

    cancelLastInsert() {
        this.setState((prevState) => ({input: prevState.input.slice(0,-1)}))
    }

    keyDown(event) {
        event.preventDefault()        
        let { float, negative, confirm, cancel } = this.props
        let key = event.key
        
        if( key === 'Backspace' ) { this.cancelLastInsert() }

        else if( key === 'Enter' ) { confirm(this.state.input) }

        else if( key === 'Escape' ) { cancel() }

        else { this.handleClick(key) }
    }

    handleClick(key) {
        let {float, negative} = this.props
        if( this.numericKeys.includes(parseFloat(key)) ) { 
            this.numericKeyClick(key)
        } else if( specialKeys({float, negative}).includes(key) ) {
            this.specialKeyClick(key) 
        }
    }

    numericKeyClick(keyPressed) {
        if( !this.props.numberOfDigits || this.state.input.length < this.props.numberOfDigits ) {
            this.setState((prevState) => ({ input: prevState.input + keyPressed }))
        }        
    }

    specialKeyClick(keyPressed) {
        // if( this.state.input.length === 0 ) return
        if(keyPressed === '-') {
            this.setState((prevState) => (
                {input: prevState.input.indexOf('-') === 0 ? prevState.input.substr(1) : '-' + prevState.input }
            ))
        }
        else if(keyPressed === '.' && this.state.input.indexOf('.') === -1) {
            this.setState((prevState) => ({input: prevState.input + keyPressed}))
        } else if(keyPressed === '<-') {
            this.setState((prevState) => ({input: prevState.input.slice(0, -1)}))
        }
    }

    render() {
        let { float, negative, displayRule, validation, label, confirm, cancel } = this.props
        let activeKeys = [...this.numericKeys, ...specialKeys({float, negative})]
        
        return (
            <Container>
                <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px'}}>    
                    <i style={{cursor: 'pointer'}} 
                       onClick={cancel} 
                       className="fa fa-remove"/>
                    <i style={{cursor: 'pointer'}} 
                       onClick={() => confirm(this.state.input)}
                       className="fa fa-check"/>
                </div>
                <Display    
                    value={this.state.input}
                    displayRule={displayRule}
                    validation={validation}
                    label={label}
                    cancel={this.cancelLastInsert} />
                <Keys>
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3, '-', 0, '.'].map( key => (
                        <StyledKeyPadButton
                            key={`button-${key}`} 
                            value={key}
                            click={(key) => this.handleClick(key) }
                            disabled={!activeKeys.includes(key)} />
                    ))}
                </Keys>
            </Container>
        )    
    }
}
  
KeyPad.propTypes = {
    confirm: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    negative: PropTypes.bool,
    float: PropTypes.bool,
    numberOfDigits: PropTypes.number,
    displayRule: PropTypes.func,
    validation: PropTypes.func
}

KeyPad.defaultProps = {
    displayRule: (value) => (value),
    validation: () => true,
    negative: true,
    float: true
}

export default onClickOutside(KeyPad)

const KeyPadButton = ({ value, theme, click, className, disabled }) => (
    <Button
        theme={theme} 
        click={click}
        className={className}
        value={value}
        disabled={disabled} />
)

const StyledKeyPadButton = styled(KeyPadButton)`
    width: 80px;
`