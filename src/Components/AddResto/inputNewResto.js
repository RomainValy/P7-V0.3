import React from 'react'

class ButtonAddResto extends React.Component{
    
    render(){
        return <div>
                    <button onClick = {(e) => {
                        e.stopPropagation();
                        console.log(this);
                    }}> ajoutes votre établissement
                    </button>
                </div>
    }
}

export default ButtonAddResto