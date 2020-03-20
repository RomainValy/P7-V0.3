import React from 'react'
import StarsRate from '../StarsRate/StarsRate'
import Context from '../RestaurantsContext'
import ButtonAddComment from './ButtonAddComment.js'
import './RestoCards.css'



class RestoCards extends React.Component {
    constructor(name, rateAverage, address, props){
        super(props);
        this.name = name;
        this.rateAverage = rateAverage;
        this.address = address
    }
   

    render(){
        
        return(
            <Context.Consumer>
            {({fiterValue}) => (   
                (fiterValue.min <= Math.round(this.props.rateAverage) &&
                    fiterValue.max >= this.props.rateAverage) &&

                    <div className ="restoCard">
                    
                    <p>{`${this.props.name}`}</p>
                    <p>{`${this.props.address}`}</p>
                    <StarsRate fixed = {true} value = {this.props.rateAverage}/>    
                        {this.props.showDetails && this.props.children}
                    <Context.Consumer>
                    {({addComment, setCurrentResto}) => (
                            <ButtonAddComment addComment = {addComment}
                            onClick = {() => {
                                setCurrentResto({name: this.props.name})
                            }}                  
                            />
                        )}    
                        
                    </Context.Consumer>    
                    
                </div>)
            }
        </Context.Consumer> 
        )
    }
}

export default RestoCards
