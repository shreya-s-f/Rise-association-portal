export default function AboutDepartmentPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 30, 60, 0.6), rgba(0, 40, 80, 0.7)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ise-c6FQUI1LwX83H3nizeTf3qWjiScXCq.jpg')`,
        }}
      />

      {/* College Logo */}
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNi6WZZSJaTf5H98iBpKkzFUNCtGR6qvM-jw&s"
        alt="BEC Logo"
        className="absolute top-5 left-5 w-16 md:w-20 h-auto z-20 drop-shadow-lg"
      />

      {/* Top Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="text-sm md:text-base font-semibold text-cyan-300 tracking-[0.3em] uppercase">B.V.V.S</div>
        <div className="relative">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Basaveshwar Engineering College
          </h1>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-blue-400 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mt-32 space-y-8">
        <div className="max-w-3xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-300">Information Science and Engineering</h2>
          <p className="text-lg md:text-xl leading-relaxed text-gray-200">
            Welcome to the Department of Information Science and Engineering at Basaveshwar Engineering College. Our
            department is committed to excellence in education, research, and innovation in the field of computer
            science and information technology.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">Vision</h3>
              <p className="text-sm text-gray-200">
                To be a center of excellence in Information Science and Engineering education and research.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">Mission</h3>
              <p className="text-sm text-gray-200">
                To provide quality education and foster innovation in emerging technologies.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">Values</h3>
              <p className="text-sm text-gray-200">Excellence, Integrity, Innovation, and Social Responsibility.</p>
            </div>
          </div>
        </div>

        <a
          href="/auth"
          className="inline-block px-8 py-4 text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-400/50"
        >
          Access Event Management System
        </a>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-sm text-cyan-300">
        © Basaveshwar Engineering College, Bagalkot. All rights reserved.
      </div>
    </div>
  )
}
