import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {bar_Chart,clipboard,checked,remove,pie_chart,bank,dashboard,file} from '../assets/js/index.js';
import { Link } from 'react-router-dom';


const Home = () => {
    useEffect(() => {
        // Only use AOS for sections outside Features/Sign-up
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <div className='font-bold flex flex-col h-full w-full bg-[#121212] text-white'>
            <nav className='w-full flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#121212] z-50'>
                <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9b59b6] 
                    hover:from-[#9b59b6] hover:to-[#00d4ff] transition-all duration-700 cursor-pointer'>
                    CoinWise
                </h1>
                <div className='font-medium flex gap-8 md:gap-10 text-lg md:text-xl text-gray-500'>
                    <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className='hover:text-[#00b8e6] transition-colors cursor-pointer'>Features</button>
                    <button onClick={() => document.getElementById('beforeafter').scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className='hover:text-[#00b8e6] transition-colors cursor-pointer'>Before & After</button>
                    <Link to='/SignUp_Login' className='hover:text-[#00b8e6] transition-colors cursor-pointer'>Get Started</Link>
                </div>
            </nav>
            <div className='pt-24 pb-24 flex flex-col md:flex-row gap-12 items-center justify-center w-full px-6 md:px-20' data-aos="fade-right">
                <div className='max-w-xl space-y-6'>
                    <h1 className='text-6xl font-bold text-white drop-shadow-lg'>Take Control of</h1>
                    <h1 className='text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9b59b6] 
                        hover:from-[#9b59b6] hover:to-[#00d4ff] drop-shadow-lg transition-all duration-700 cursor-pointer'>
                        Your Finances with <span className='block'>CoinWise</span>
                    </h1>
                    <h5 className='text-2xl text-gray-300 leading-relaxed'>
                        Track expenses, <span className='font-medium text-white'>visualize</span> spending habits,
                        <span className='block'>and save smarter - all in one place.</span>
                    </h5>
                    <div className='mt-8 flex justify-start'>
                        <Link to='/SignUp_Login' className='rounded-xl px-10 py-4 bg-[#00d4ff] text-black font-semibold shadow-lg transform transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl text-lg cursor-pointer'>
                            Get Started
                        </Link>
                    </div>
                </div>
                <div className='relative'>
                    <div className='w-80 h-72 bg-gray-800 rounded-xl flex justify-center items-center shadow-lg 
                        transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl'>
                        <img src={bar_Chart} className="w-32 h-32 transform transition-transform duration-500 ease-in-out hover:scale-110" alt="bar_Chart" />
                    </div>
                </div>
            </div>
            <div id="features"
                className='pt-24 pb-24 px-6 md:px-20 scroll-mt-32'
                data-aos="fade-up"
                data-aos-offset="400"
                data-aos-duration="1100"
                data-aos-once="true"
                data-aos-anchor-placement="top-bottom">
                <h1 className="text-center text-5xl font-semibold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9b59b6] 
      hover:from-[#9b59b6] hover:to-[#00d4ff] drop-shadow-md transition-all duration-700 cursor-pointer">
                    Features
                </h1>

                {/* Grid layout for feature cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center'>
                    {[{
                        img: clipboard,
                        title: "Smart Expense Tracking",
                        desc: "Automatically categorize and track your expenses effortlessly."
                    }, {
                        img: dashboard,
                        title: "Interactive Dashboard",
                        desc: "Visualize spending with beautiful, dynamic charts and insights."
                    }, {
                        img: file,
                        title: "PDF Reports",
                        desc: "Receive detailed weekly or monthly financial reports via email."
                    }, {
                        img: bank,
                        title: "Bank Statement Sync",
                        desc: "Sync bank data automatically or upload CSVs with one click."
                    }].map((feature, idx) => (
                        <div
                            key={idx}
                            className='group relative p-8 border border-gray-700 rounded-2xl w-64 min-h-[18rem] bg-gray-900 shadow-md
                   transform transition-all duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl'
                        >
                            {/* Icon */}
                            <div className='flex justify-center mb-6'>
                                <div className='p-4 bg-gray-800 rounded-full shadow-inner transition-transform duration-500 group-hover:scale-110'>
                                    <img src={feature.img} className="w-12 h-12" alt={feature.title} />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-semibold text-center text-white mb-3">
                                {feature.title}
                            </h2>

                            {/* Description */}
                            <p className='text-gray-400 text-center text-base leading-relaxed'>
                                {feature.desc}
                            </p>

                            {/* Bottom subtle glow */}
                            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1 
                        bg-gradient-to-r from-[#00d4ff] to-[#9b59b6] opacity-0 group-hover:opacity-100 
                        transition-opacity duration-500 rounded-full'></div>
                        </div>
                    ))}
                </div>
            </div>

            <div id="beforeafter" className='pt-24 pb-24 flex flex-wrap gap-16 justify-center items-start px-6 md:px-20 scroll-mt-32' data-aos="fade-right">
                <div>
                    <h1 className='text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9b59b6] 
                        hover:from-[#9b59b6] hover:to-[#00d4ff] drop-shadow-md transition-all duration-700 cursor-pointer'>
                        Before & After
                    </h1>
                    <div className='flex flex-col gap-6'>
                        <div className='flex items-start gap-3 p-4 rounded-xl bg-gray-900 shadow-md 
                            transform transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl'>
                            <img src={remove} className="w-6 h-6 mt-1" alt="" />
                            <div>
                                <h1 className="text-xl font-medium text-white">Before Coinwise</h1>
                                <p className='text-gray-400 text-base mt-1'>Manual Expense Tracking <br />No Idea where money goes <br />Forget to save</p>
                            </div>
                        </div>
                        <div className='flex items-start gap-3 p-4 rounded-xl bg-gray-900 shadow-md 
                            transform transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl'>
                            <img src={checked} className="w-6 h-6 mt-1" alt="" />
                            <div>
                                <h1 className="text-xl font-medium text-[#00d4ff]">After Coinwise</h1>
                                <p className='text-gray-300 text-base mt-1'>Automated tracking and insights <br />Know exactly where money goes <br />Save efficiently</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='border border-gray-700 w-80 h-90 rounded-xl p-6 flex flex-col gap-4 bg-gray-900 shadow-lg
                    transform transition-transform duration-500 ease-in-out hover:-translate-y-3 hover:shadow-2xl'>

                    <div className='w-full h-64 flex items-center justify-center bg-gray-800 rounded-lg shadow-inner 
                        transform transition-transform duration-500 ease-in-out hover:scale-105'>
                        <img src={pie_chart} className="w-28 h-28 transform transition-transform duration-500 ease-in-out hover:scale-110" alt="pie_chart" />
                    </div>

                    <h2 id="getstarted" className='text-gray-200 text-center text-lg transition-colors duration-500 ease-in-out hover:text-[#00d4ff]'>
                        Sign up to unlock your personalized financial dashboard
                    </h2>

                    <Link to='/SignUp_Login' className='rounded-xl px-10 py-4 bg-[#00d4ff] text-black font-semibold shadow-lg
                        transform transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:bg-[#00b8e6] self-center text-lg cursor-pointer'>
                        Get Started
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
