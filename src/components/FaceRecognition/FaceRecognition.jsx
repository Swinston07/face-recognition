import "./FaceRecognition.css";

const FaceRecognition = ({ imageUrl, boxes, onImageLoad }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="face-container">
      <div className="image-wrapper">
        <img
          id="inputimage"
          src={imageUrl}
          alt="Detection input"
          width="500"
          onLoad={onImageLoad}
        />

        {boxes.map((box, index) => (
          <div
            key={index}
            className="bounding-box"
            style={{
              top: box.topRow,
              right: box.rightCol,
              bottom: box.bottomRow,
              left: box.leftCol,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FaceRecognition;