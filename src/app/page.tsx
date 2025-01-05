"use client"

export default function Home() {
  const galleryImages = [
    {
      before: "/examples/before/yahiko.jpeg",
      after: "/examples/text-behind-image (2).png",
      description: "YouTube Thumbnail"
    },
    {
      before: "/examples/before/satoru.jpeg",
      after: "/examples/text-behind-image (3).png",
      description: "Instagram Post"
    },
    {
      before: "/examples/before/wallpaper.jpeg",
      after: "/examples/text-behind-image.png",
      description: "Social Media Banner"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">TextBehindImage</h1>
          <div className="space-x-4 sm:space-x-6">
            <a href="#features" className="hover:text-gray-200">Features</a>
            <button onClick={() => window.location.href = '/login'} className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Try Now
            </button>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Transform Your Images with Perfect Text Placement</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8">Create stunning visuals with multiple text layers, advanced effects, and professional export options.</p>
            <button onClick={() => window.location.href = '/login'} className="bg-white text-indigo-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium text-base sm:text-lg hover:bg-gray-100 transition-colors">
              Start Creating
            </button>
          </div>
          <div className="relative mt-8 md:mt-0">
            <img src="/examples/text-behind-image.png" alt="App Demo" className="rounded-lg shadow-2xl w-full"/>
            <div className="absolute -bottom-4 -right-4 bg-purple-600 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
              Export for Any Platform
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {[
              {
                title: "Multiple Text Layers",
                description: "Add multiple text layers with independent controls. Perfect for creating depth and visual hierarchy.",
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                  </svg>
                )
              },
              {
                title: "Advanced Effects",
                description: "Apply gradients, shadows, and transformations to make your text pop and create eye-catching designs.",
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                  </svg>
                )
              },
              {
                title: "Export Options",
                description: "Download in multiple formats. Optimized presets for YouTube thumbnails and Instagram posts.",
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white p-8 rounded-xl shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out"
              >
                <div className="h-14 w-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Transform Any Image</h2>
          <p className="text-lg sm:text-xl text-gray-600 text-center mb-12 sm:mb-16">See how TextBehind transforms ordinary images into eye-catching content</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {galleryImages.map((image, i) => (
              <div key={i} className="group relative">
                <div className="relative h-64 sm:h-80 overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="absolute inset-0 transition-transform duration-500 transform group-hover:translate-y-full">
                    <img src={image.before} alt="Before" className="w-full h-full object-cover"/>
                  </div>
                  <div className="absolute inset-0 transition-transform duration-500 transform translate-y-full group-hover:translate-y-0">
                    <img src={image.after} alt="After" className="w-full h-full object-cover"/>
                  </div>
                </div>
                <p className="mt-4 text-center text-base sm:text-lg font-medium">{image.description}</p>
                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs sm:text-sm px-3 py-1 rounded-full">
                  Hover to see result
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Ready to Create?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">Join now and start creating stunning visuals with TextBehind.</p>
          <button onClick={() => window.location.href = '/login'} className="bg-white text-indigo-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium text-base sm:text-lg hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">TextBehind</h3>
              <p className="text-gray-400">Transform your images with perfect text placement</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p> 2025 TextBehind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
