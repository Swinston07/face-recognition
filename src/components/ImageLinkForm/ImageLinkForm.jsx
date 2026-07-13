import React from 'react';
import './ImageLinkForm.css';

const ImageLinkForm = ({ onInputChange, onButtonSubmit }) => {
    return (
        <div>
            <p className='f4' style = {{display: 'flex', justifyContent: 'center'}}>
                {'This Magic Brain will detect faces in your pictures. Give it a try!'}
            </p>
            <div style = {{display: 'flex', justifyContent: 'center'}}>
                <div className = ' form pa4 br3 shadow-5 center' style = {{display: 'flex', justifyContent: 'center'}}>
                    <input className='f4 pa2 w-70 center' type='text' placeholder='Enter image URL' onChange = { onInputChange }/>
                    <button 
                        className = 'w-30 grow f4 link ph3 pv2 dib white bg-light-purple'
                        onClick = { onButtonSubmit }
                    >
                        Detect
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageLinkForm;
