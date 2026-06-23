export default function Slide4KeyScreens() {
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
        flexDirection: "column",
        padding: "6vh 8vw",
        boxSizing: "border-box",
      }}
    >
      {/* Accent shapes */}
      <div
        style={{
          position: "absolute",
          top: "9vh",
          right: "9vw",
          width: "2.2vw",
          height: "2.2vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14vh",
          left: "4vw",
          width: "5vw",
          height: "5vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.06,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "44vh",
          left: "3.5vw",
          width: "1vw",
          height: "1vw",
          borderRadius: "0.2vw",
          backgroundColor: "#B5707F",
          opacity: 0.5,
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ zIndex: 10, marginBottom: "5vh" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1vw",
            backgroundColor: "rgba(181, 112, 127, 0.12)",
            borderRadius: "2vw",
            marginBottom: "2vh",
          }}
        >
          <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
          <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Key Screens
          </span>
        </div>
        <h2
          style={{
            fontSize: "3.8vw",
            fontWeight: 800,
            color: "#1A1210",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Five screens, one experience
          <span style={{ color: "#B5707F" }}>.</span>
        </h2>
      </div>

      {/* Screens grid — 5 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "2vw",
          flex: 1,
          alignContent: "center",
          zIndex: 10,
        }}
      >
        {/* Home */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.2vw",
            padding: "3vh 1.8vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
            boxShadow: "0 4px 20px rgba(26,18,16,0.05)",
          }}
        >
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              borderRadius: "0.8vw",
              backgroundColor: "rgba(181,112,127,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#B5707F", borderRadius: "0.3vw" }} />
          </div>
          <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Home</p>
          <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            Next appointment + featured services
          </p>
        </div>
        {/* Services */}
        <div
          style={{
            backgroundColor: "#B5707F",
            borderRadius: "1.2vw",
            padding: "3vh 1.8vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
            boxShadow: "0 4px 20px rgba(181,112,127,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-2vw",
              right: "-2vw",
              width: "7vw",
              height: "7vw",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              borderRadius: "0.8vw",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "white", borderRadius: "0.3vw" }} />
          </div>
          <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "white", margin: 0 }}>Services</p>
          <p style={{ fontSize: "1.15vw", color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            Search &amp; filter 8 treatments by category
          </p>
        </div>
        {/* Booking */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.2vw",
            padding: "3vh 1.8vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
            boxShadow: "0 4px 20px rgba(26,18,16,0.05)",
          }}
        >
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              borderRadius: "0.8vw",
              backgroundColor: "rgba(201,149,106,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#C9956A", borderRadius: "50%" }} />
          </div>
          <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Booking</p>
          <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            3-step guided booking flow
          </p>
        </div>
        {/* My Bookings */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.2vw",
            padding: "3vh 1.8vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
            boxShadow: "0 4px 20px rgba(26,18,16,0.05)",
          }}
        >
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              borderRadius: "0.8vw",
              backgroundColor: "rgba(181,112,127,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "1.4vw", height: "0.4vh", backgroundColor: "#B5707F", borderRadius: "0.2vw" }} />
          </div>
          <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Bookings</p>
          <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            Upcoming and past appointments
          </p>
        </div>
        {/* Profile */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.2vw",
            padding: "3vh 1.8vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
            boxShadow: "0 4px 20px rgba(26,18,16,0.05)",
          }}
        >
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              borderRadius: "50%",
              backgroundColor: "rgba(201,149,106,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#C9956A", borderRadius: "50%" }} />
          </div>
          <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Profile</p>
          <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            Personal info and booking stats
          </p>
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
          zIndex: 10,
          borderTop: "1px solid rgba(26,18,16,0.07)",
          paddingTop: "2vh",
          marginTop: "4vh",
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>Spa &amp; Beauty App</span>
          <span>/</span>
          <span>Product Overview</span>
        </div>
        <div style={{ fontWeight: 700, color: "#1A1210" }}>04</div>
      </div>
    </div>
  );
}
