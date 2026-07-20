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
            setIsSignedIn(false);
        }
        if(route === 'home') {
            setIsSignedIn(true);
        }
        setRoute(route);
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

        const sendImageToHuggingFace = async () => {
            try {
                const imageResponse = await fetch(imageUrl);

                if (!imageResponse.ok) {
                throw new Error("Could not download the image.");
                }

                const imageBlob = await imageResponse.blob();

                const apiResponse = await fetch(
                    "https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50",
                    {
                        method: "POST",
                        headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
                        "Content-Type": imageBlob.type || "application/octet-stream",
                        },
                        body: imageBlob,
                    },
                );

                const data = await apiResponse.json();

                if (!apiResponse.ok) {
                throw new Error(data.error || "Hugging Face request failed.");
                }

                const detectedBoxes = calculateFaceLocations(data);
                setBoxes(detectedBoxes);
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
                    <Rank />
                    <ImageLinkForm 
                        onInputChange={onInputChange}
                        onButtonSubmit={onSubmit} 
                    />
                </>
            ) 
            
            : (route === 'signin'
            ? <Signin onRouteChange = {onRouteChange}/>
            : <Register onRouteChange = {onRouteChange}/>
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