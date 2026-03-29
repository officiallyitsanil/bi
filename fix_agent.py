import sys

with open('src/app/property-details/page.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '<div className=\"rounded-xl border border-border/80 bg-card text-card-foreground shadow-md overflow-hidden\">'
end_marker = '{/* Why Clients Choose Us for Consultation */}'

start_idx = text.find(start_marker)
end_idx = text.rfind('<div className=\"h-px w-full bg-border\" />', start_idx, text.find(end_marker))

if start_idx == -1 or end_idx == -1:
    print('Failed to find markers')
    sys.exit(1)

replacement = """<div className="rounded-none border-t-0 border-r-0 border-l-0 border-b border-border/80 bg-white dark:bg-card overflow-hidden">
                                {(() => {
                                    const agentName = safeDisplay(property.agentDetails?.name || property.agentName);
                                    const agentPhone = property.agentDetails?.phone || property.agentPhone || "";
                                    const agentEmail = property.agentDetails?.email || property.agentEmail || "";
                                    const agentImage = property.agentImage || property.agentDetails?.image || "";
                                    const agentTag = safeDisplay(property.agentDetails?.tag) || "Buildersinfo Expert";
                                    const agentTagline = safeDisplay(property.agentDetails?.tagline);
                                    const assistedLogos = property.agentDetails?.assistedCorporates || [];
                                    const propTitle = safeDisplay(property.propertyName || property.name);
                                    const maskedPhone = agentPhone
                                        ? (() => {
                                            const digits = agentPhone.replace(/[^0-9]/g, "");
                                            const num = digits.length >= 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);
                                            if (num.length >= 4) return +91 ******;
                                            return agentPhone;
                                        })()
                                        : "";
                                    return (
                                        <>
                                            <div className="px-5 pt-5 pb-5">
                                                <h3 className="text-[16px] text-gray-900 dark:text-gray-100 leading-snug">
                                                    Interested in <span className="font-bold">{propTitle}</span> ?
                                                </h3>

                                                <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 justify-between">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className="relative h-[90px] w-[75px] shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200">
                                                            {agentImage ? (
                                                                <img src={agentImage} alt={agentName} className="h-full w-full object-cover object-top" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground" aria-hidden>
                                                                    {agentName ? agentName.charAt(0) : "-"}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0 flex-1 pt-1">
                                                            <p className="text-[14.5px] text-gray-900 dark:text-gray-100 mb-2">
                                                                Say Hi To <span className="font-bold">{agentName}</span>
                                                            </p>
                                                            <div className="flex items-center gap-4 flex-wrap w-full mb-3">
                                                                {agentPhone && (
                                                                    <a
                                                                        href={	el:}
                                                                        onClick={(e) => handlePhoneClick(e, agentPhone)}
                                                                        className="text-[13px] text-gray-900 dark:text-gray-300 tracking-wide hover:underline"
                                                                    >
                                                                        {maskedPhone}
                                                                    </a>
                                                                )}
                                                                <div className="flex items-center gap-2.5">
                                                                    {agentPhone && (
                                                                        <a
                                                                            href={	el:}
                                                                            onClick={(e) => handlePhoneClick(e, agentPhone)}
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="Call"
                                                                        >
                                                                            <img src="/property-details/agent-social/call.svg" alt="Call" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                    {agentEmail && (
                                                                        <a
                                                                            href={mailto:}
                                                                            onClick={(e) => handleEmailClick(e, agentEmail, Inquiry: )}
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="Message"
                                                                        >
                                                                            <img src="/property-details/agent-social/message.svg" alt="Message" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                    {(property.agentDetails?.whatsapp || agentPhone) && (
                                                                        <a
                                                                            href={https://wa.me/?text=Hi, I'm interested in }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="WhatsApp"
                                                                        >
                                                                            <img src="/property-details/agent-social/whatsapp.svg" alt="WhatsApp" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="inline-flex items-center rounded-md border border-[#86cfa2] bg-[#f0f9f3] px-2.5 py-0.5 text-[11px] font-bold text-[#1f8c4c] dark:bg-[#1a8e48]/10 dark:border-[#1a8e48]/40 dark:text-[#4ade80]">
                                                                    {agentTag}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 sm:pt-4 sm:pr-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => agentPhone && handlePhoneClick(e, agentPhone)}
                                                            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[6px] border border-[#a4ecbe] bg-[#f1fdf5] px-5 sm:px-6 text-[18px] font-bold text-[#208346] hover:bg-[#e6fceb] dark:bg-[#1f5431] dark:border-[#2d7644] dark:text-white dark:hover:bg-[#1b482a] transition-colors shadow-sm"
                                                        >
                                                            Contact {(agentName && agentName.split(" ")[0]) || agentName || "Agent"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-5 pb-6">
                                                <div className="bg-[#eff2f4] dark:bg-gray-800/60 rounded-[4px] p-5">
                                                    {agentTagline ? (
                                                        <p className="text-[15px] leading-relaxed text-[#414d55] dark:text-gray-300">
                                                            {agentTagline}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[15px] leading-[1.6] text-[#414d55] dark:text-gray-300">
                                                            {agentName ? agentName.split(" ")[0] : "Agent"}&apos;s team assisted 500+ corporates in Bangalore to move into their new office.
                                                        </p>
                                                    )}
                                                    <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                                                        {(assistedLogos.length > 0 ? assistedLogos.slice(0, 5) : [
                                                            { name: "Pepsi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/120px-Pepsi_logo_2014.svg.png" },
                                                            { name: "GE", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/General_Electric_logo.svg/120px-General_Electric_logo.svg.png" },
                                                            { name: "P&G", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Procter_%26_Gamble_logo.svg/120px-Procter_%26_Gamble_logo.svg.png" },
                                                            { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/120px-HP_logo_2012.svg.png" },
                                                            { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/120px-Dell_logo_2016.svg.png" }
                                                        ]).map((item, i) => {
                                                            const rawVal = typeof item === "string" ? item : (item?.name || item?.url || item?.logo || "");
                                                            if (!rawVal) return null;

                                                            const logoSrc = typeof item === "object" && item.logo ? item.logo : resolveCorporateLogoSrc(rawVal);
                                                            const logoName = getCorporateLogoDisplayName(rawVal);

                                                            return logoSrc ? (
                                                                <div
                                                                    key={i}
                                                                    className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center p-1.5"
                                                                >
                                                                    <img alt={logoName || ""} src={logoSrc} className="h-full w-full object-contain" />
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-600 shadow-sm"
                                                                >
                                                                    {safeDisplay(logoName || rawVal)}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
"""

new_text = text[:start_idx] + replacement + text[end_idx:]

with open('src/app/property-details/page.js', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Success!')
