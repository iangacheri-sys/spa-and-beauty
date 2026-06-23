const base = import.meta.env.BASE_URL;

export default function Slide3TheApp() {
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
        boxSizing: "border-box",
      }}
    >
      {/* Accent shapes */}
      <div
        style={{
          position: "absolute",
          top: "8vh",
          right: "8vw",
          width: "2.5vw",
          height: "2.5vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.18,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12vh",
          left: "4vw",
          width: "5.5vw",
          height: "5.5vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.07,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "42vh",
          left: "3.5vw",
          width: "1.1vw",
          height: "1.1vw",
          borderRadius: "0.2vw",
          backgroundColor: "#B5707F",
          opacity: 0.55,
          transform: "rotate(45deg)",
        }}
      />

      {/* Left: Text content */}
      <div
        style={{
          width: "50vw",
          padding: "7vh 8vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        <div>
          {/* Section label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(181, 112, 127, 0.12)",
              borderRadius: "2vw",
              marginBottom: "3vh",
            }}
          >
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              The App
            </span>
          </div>

          <h2
            style={{
              fontSize: "4.2vw",
              fontWeight: 800,
              color: "#1A1210",
              margin: "0 0 4vh 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            A full-featured mobile experience
            <span style={{ color: "#B5707F" }}>.</span>
          </h2>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.4vh" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.4vw" }}>
              <div
                style={{
                  width: "2.5vw",
                  height: "2.5vw",
                  borderRadius: "0.6vw",
                  backgroundColor: "rgba(181,112,127,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.3vh",
                }}
              >
                <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
              </div>
              <div>
                <p style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Browse by category</p>
                <p style={{ fontSize: "1.25vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>
                  Facial, Massage, Nails, Hair, Body — all searchable and filterable.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.4vw" }}>
              <div
                style={{
                  width: "2.5vw",
                  height: "2.5vw",
                  borderRadius: "0.6vw",
                  backgroundColor: "rgba(201,149,106,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.3vh",
                }}
              >
                <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#C9956A", borderRadius: "50%" }} />
              </div>
              <div>
                <p style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Specialist profiles</p>
                <p style={{ fontSize: "1.25vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>
                  View ratings, experience, and availability before booking.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.4vw" }}>
              <div
                style={{
                  width: "2.5vw",
                  height: "2.5vw",
                  borderRadius: "0.6vw",
                  backgroundColor: "rgba(181,112,127,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.3vh",
                }}
              >
                <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
              </div>
              <div>
                <p style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>3-step booking flow</p>
                <p style={{ fontSize: "1.25vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>
                  Pick specialist &#8594; date &amp; time &#8594; confirm. Done.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85vw",
            color: "#9B7B7B",
            fontWeight: 500,
            borderTop: "1px solid rgba(26,18,16,0.07)",
            paddingTop: "2vh",
          }}
        >
          <div style={{ display: "flex", gap: "2vw" }}>
            <span>Spa &amp; Beauty App</span>
            <span>/</span>
            <span>Product Overview</span>
          </div>
          <div style={{ fontWeight: 700, color: "#1A1210" }}>03</div>
        </div>
      </div>

      {/* Right: Illustration */}
      <div
        style={{
          width: "50vw",
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
            width: "40vw",
            height: "40vw",
            backgroundColor: "rgba(181,112,127,0.06)",
            borderRadius: "50%",
            right: "-8vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-app.png`}
          crossOrigin="anonymous"
          alt="App illustration"
          style={{
            height: "75%",
            width: "auto",
            objectFit: "contain",
            zIndex: 2,
            position: "relative",
          }}
        />
      </div>
    </div>
  );
}
