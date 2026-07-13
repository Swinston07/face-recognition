import React from 'react';

const Logo = () => {
    return(
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <div className="white f3">
                {'Sterling, your current rank is...'}
            </div>
            <div className="white f1">
                {'#5'}
            </div>
        </div>
    )
}

export default Logo;
