const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#FAF7F4",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        display: "flex",
      }}
    >
      {/* Background geometric accents */}
      <div
        style={{
          position: "absolute",
          top: "12vh",
          left: "7vw",
          width: "2.2vw",
          height: "2.2vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.18,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18vh",
          left: "38vw",
          width: "4.5vw",
          height: "4.5vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "9vh",
          right: "46vw",
          width: "1.6vw",
          height: "1.6vw",
          borderRadius: "0.25vw",
          backgroundColor: "#B5707F",
          opacity: 0.75,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "28vh",
          right: "50vw",
          width: "1vw",
          height: "1vw",
          borderRadius: "50%",
          border: "0.2vw solid #C9956A",
          opacity: 0.35,
        }}
      />

      {/* Left Content Side */}
      <div
        style={{
          width: "46vw",
          height: "100vh",
          padding: "6vh 8vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div
            style={{
              width: "1.5vw",
              height: "1.5vw",
              backgroundColor: "#B5707F",
              borderRadius: "0.3vw",
            }}
          />
          <div
            style={{
              fontSize: "1.2vw",
              fontWeight: 700,
              color: "#1A1210",
              letterSpacing: "-0.02em",
            }}
          >
            Spa &amp; Beauty
          </div>
        </div>

        {/* Hero text block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3vh", marginTop: "-8vh" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(181, 112, 127, 0.12)",
              borderRadius: "2vw",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: "0.5vw",
                height: "0.5vw",
                backgroundColor: "#B5707F",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                fontSize: "0.9vw",
                fontWeight: 600,
                color: "#B5707F",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Mobile App
            </span>
          </div>

          <h1
            style={{
              fontSize: "5.8vw",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#1A1210",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Spa &amp;
            <br />
            Beauty
            <span style={{ color: "#B5707F" }}>.</span>
          </h1>

          <p
            style={{
              fontSize: "1.5vw",
              color: "#7D5C5C",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "28vw",
              fontWeight: 400,
            }}
          >
            A mobile app for booking spa and beauty appointments — built for Kenya.
          </p>

          <p
            style={{
              fontSize: "1.3vw",
              color: "#C9956A",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "0.04em",
            }}
          >
            Book. Relax. Repeat.
          </p>

          <div style={{ width: "4vw", height: "0.3vh", backgroundColor: "#1A1210", marginTop: "0.5vh" }} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: "2vw",
            fontSize: "0.85vw",
            color: "#9B7B7B",
            fontWeight: 500,
          }}
        >
          <span>Spa &amp; Beauty App</span>
          <span>/</span>
          <span>Product Overview</span>
          <span>/</span>
          <span>2026</span>
        </div>
      </div>

      {/* Right Illustration Side */}
      <div
        style={{
          width: "54vw",
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "44vw",
            height: "44vw",
            backgroundColor: "rgba(181, 112, 127, 0.05)",
            borderRadius: "50%",
            zIndex: 1,
            right: "-10vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-spa-hero.png`}
          crossOrigin="anonymous"
          alt="Spa hero illustration"
          style={{
            width: "82%",
            height: "82%",
            objectFit: "contain",
            zIndex: 2,
            position: "relative",
            marginRight: "4vw",
          }}
        />
      </div>
    </div>
  );
}
