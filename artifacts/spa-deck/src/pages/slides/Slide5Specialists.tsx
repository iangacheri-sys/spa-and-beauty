const base = import.meta.env.BASE_URL;

export default function Slide5Specialists() {
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
          top: "10vh",
          right: "9vw",
          width: "2.5vw",
          height: "2.5vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.16,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "16vh",
          right: "38vw",
          width: "1.2vw",
          height: "1.2vw",
          borderRadius: "0.2vw",
          backgroundColor: "#C9956A",
          opacity: 0.45,
          transform: "rotate(45deg)",
        }}
      />

      {/* Left: illustration */}
      <div
        style={{
          width: "42vw",
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
            width: "38vw",
            height: "38vw",
            backgroundColor: "rgba(181,112,127,0.07)",
            borderRadius: "50%",
            left: "-8vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-team.png`}
          crossOrigin="anonymous"
          alt="Team illustration"
          style={{
            width: "88%",
            height: "auto",
            objectFit: "contain",
            zIndex: 2,
            position: "relative",
          }}
        />
      </div>

      {/* Right: content */}
      <div
        style={{
          flex: 1,
          padding: "7vh 7vw 6vh 4vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(181, 112, 127, 0.12)",
              borderRadius: "2vw",
              marginBottom: "2.5vh",
            }}
          >
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Our Specialists
            </span>
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              color: "#1A1210",
              margin: "0 0 4vh 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            5 certified experts
            <span style={{ color: "#B5707F" }}>.</span>
          </h2>

          {/* Specialist list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
            {/* 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "3.2vw",
                  height: "3.2vw",
                  borderRadius: "50%",
                  backgroundColor: "#D4A5A5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "white" }}>AW</span>
              </div>
              <div>
                <span style={{ fontSize: "1.35vw", fontWeight: 700, color: "#1A1210" }}>Amara Wanjiku</span>
                <span style={{ fontSize: "1.15vw", color: "#7D5C5C", marginLeft: "0.8vw" }}>Facial Specialist · 8 yrs</span>
              </div>
            </div>
            {/* 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "3.2vw",
                  height: "3.2vw",
                  borderRadius: "50%",
                  backgroundColor: "#A5B4C4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "white" }}>GO</span>
              </div>
              <div>
                <span style={{ fontSize: "1.35vw", fontWeight: 700, color: "#1A1210" }}>Grace Odhiambo</span>
                <span style={{ fontSize: "1.15vw", color: "#7D5C5C", marginLeft: "0.8vw" }}>Massage Therapist · 6 yrs</span>
              </div>
            </div>
            {/* 3 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "3.2vw",
                  height: "3.2vw",
                  borderRadius: "50%",
                  backgroundColor: "#C4A5D4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "white" }}>FH</span>
              </div>
              <div>
                <span style={{ fontSize: "1.35vw", fontWeight: 700, color: "#1A1210" }}>Fatima Hassan</span>
                <span style={{ fontSize: "1.15vw", color: "#7D5C5C", marginLeft: "0.8vw" }}>Nail Artist · 5 yrs</span>
              </div>
            </div>
            {/* 4 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "3.2vw",
                  height: "3.2vw",
                  borderRadius: "50%",
                  backgroundColor: "#D4C4A5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "white" }}>ZK</span>
              </div>
              <div>
                <span style={{ fontSize: "1.35vw", fontWeight: 700, color: "#1A1210" }}>Zoe Kimani</span>
                <span style={{ fontSize: "1.15vw", color: "#7D5C5C", marginLeft: "0.8vw" }}>Hair Stylist · 7 yrs</span>
              </div>
            </div>
            {/* 5 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "3.2vw",
                  height: "3.2vw",
                  borderRadius: "50%",
                  backgroundColor: "#A5C4B4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "white" }}>AM</span>
              </div>
              <div>
                <span style={{ fontSize: "1.35vw", fontWeight: 700, color: "#1A1210" }}>Aisha Mwangi</span>
                <span style={{ fontSize: "1.15vw", color: "#7D5C5C", marginLeft: "0.8vw" }}>Beauty Therapist · 4 yrs</span>
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
          <div style={{ fontWeight: 700, color: "#1A1210" }}>05</div>
        </div>
      </div>
    </div>
  );
}
