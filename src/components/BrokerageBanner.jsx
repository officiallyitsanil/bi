import React from 'react';

const BrokerageBanner = ({ className = "" }) => {
    return (
        <section className={`relative bg-primary text-primary-foreground overflow-hidden py-16 ${className}`}>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-foreground/10 rounded-full"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">Brokerage - Free Real Estate at Your Fingertips</h2>
                        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto md:mx-0 text-sm md:text-base">
                            Buildersinfo is India&apos;s first brokerage-free real estate discovery platform. Find properties, projects and builders in your city.
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <a className="inline-block transition-transform hover:scale-105" href="#">
                                <img
                                    alt="Download on the App Store"
                                    src="https://c.housingcdn.com/demand/s/client/common/assets/app-store.10009972.png"
                                    width="144"
                                    height="48"
                                    className="h-12 w-auto"
                                />
                            </a>
                            <a className="inline-block transition-transform hover:scale-105" href="#">
                                <img
                                    alt="Get it on Google Play"
                                    src="https://c.housingcdn.com/demand/s/client/common/assets/google-play.2c209e8c.png"
                                    width="144"
                                    height="48"
                                    className="h-12 w-auto"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="relative h-full min-h-[250px] md:min-h-[300px] hidden md:flex items-center justify-center">
                        <img
                            alt="BuildersInfo App on a phone"
                            src="https://i.ibb.co/v6CN21Pt/image-Photoroom.png"
                            width="300"
                            height="300"
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrokerageBanner;
