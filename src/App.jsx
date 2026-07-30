import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import Signin from './components/Signin/Signin.jsx';
import Register from './components/Register/Register.jsx';
import { loadSlim } from '@tsparticles/slim';

function App() {
    const [input, setInput] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [boxes, setBoxes] = useState([]);
    const [route, setRoute] = useState('signin');
    const [isSignedIn, setIsSignedIn] = useState(false);

    const initialUser = {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    };


    const [user, setUser] = useState(initialUser);

    const resetState = () => {
        setInput('');
        setImageUrl('');
        setBoxes([]);
        setUser(initialUser);
        setIsSignedIn(false);
    }

    const onInputChange = (event) => {
        console.log(event.target.value);
        setInput(event.target.value);
    }

    const onSubmit = () => {
        console.log('click');
        setBoxes([]);
        setImageUrl(input);
    }

    const onRouteChange = (route) => {
        if(route === 'signin') {
            resetState();
        }
        if(route === 'home') {
            setIsSignedIn(true);
        }
        setRoute(route);
    }

    const loadUser = (data) => {
        setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        });
    }

    const createBoundingBox = (pixelBox, imageWidth, imageHeight) => {
        return {
            leftCol: pixelBox.xmin / imageWidth,
            topRow: pixelBox.ymin / imageHeight,
            rightCol: pixelBox.xmax / imageWidth,
            bottomRow: pixelBox.ymax / imageHeight,
        };
    };

        const calculateFaceLocations = (data) => {
            const image = document.getElementById("inputimage");

            if (!image) {
                return [];
            }

            const originalWidth = image.naturalWidth;
            const originalHeight = image.naturalHeight;

            const displayedWidth = image.width;
            const displayedHeight = image.height;

            const detectedPeople = data.filter((item) => item.label === "person");

            return detectedPeople.map((person) => {
                const box = createBoundingBox(
                person.box,
                originalWidth,
                originalHeight,
                );

                return {
                leftCol: box.leftCol * displayedWidth,
                topRow: box.topRow * displayedHeight,
                rightCol: displayedWidth - box.rightCol * displayedWidth,
                bottomRow: displayedHeight - box.bottomRow * displayedHeight,
                };
            });
        };

        useEffect(() => {
            fetch('http://localhost:3000')
            .then(response => response.json())
            .then(console.log)
            .catch(err => console.error(err));
        }, []);

    const updateEntries = async () => {
        try {
            const response = await fetch('http://localhost:3000/image', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                }),
            });

            const newEntries = await response.json();

            if (!response.ok) {
                throw new Error(newEntries || 'Could not update entries');
            }

            setUser((previousUser) => ({
                ...previousUser,
                entries: newEntries,
            }));
        } catch (error) {
            console.error('Entries update error:', error);
        }
    };

        const sendImageToHuggingFace = async () => {
            try {
                const response = await fetch('http://localhost:3000/imageurl', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        imageUrl
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                throw new Error(data.error || "Hugging Face request failed.");
                }

                const detectedBoxes = calculateFaceLocations(data);
                setBoxes(detectedBoxes);

                await updateEntries();
            } catch (error) {
                console.error(error);
                setBoxes([]);
            }
        };

    const particlesOptions = useMemo(() => ({
        particles: {
            number: {
                value: 300,
                density: {
                enable: true,
                area: 150
                },
            },
            color: {
                value: '#ffffff',
            },
            links: {
                enable: true,
                color: '#ffffff',
                distance: 150,
            },
            move: {
                enable: true,
                speed: 2,
            },
        },

        interactivity: {
            events: {
                onHover: {
                enable: true,
                mode: "repulse"
                }
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.2
                }
        }
        },
    }), []);

  return (
    <ParticlesProvider init={loadSlim}>
      <div className="App">
        <Particles className="tsparticles" id="tsparticles" options={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange}/>
        { route === 'home' 
            ? (
                <>
                    <Logo />
                    <Rank 
                        name={user.name}
                        entries={user.entries}
                    />
                    <ImageLinkForm 
                        onInputChange={onInputChange}
                        onButtonSubmit={onSubmit} 
                    />
                </>
            )
            
            : (route === 'signin'
            ? <Signin
                loadUser = {loadUser}
                onRouteChange = {onRouteChange}
            />
            : <Register 
                loadUser = {loadUser}
                onRouteChange = {onRouteChange}/>
            )
        }

        <FaceRecognition
            imageUrl={imageUrl}
            boxes={boxes}
            onImageLoad={sendImageToHuggingFace}
        />
      </div>
    </ParticlesProvider>
  );
}

export default App;