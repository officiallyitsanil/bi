import re

with open('src/app/property-details/page.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '<div className=\"overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm\" id=\"specs\">'
end_marker = 'id=\"custom-infra\"'

# find start and end indices
start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

# backtrack to the start of the <div className=\"rounded-xl... id=\"custom-infra\">\n
end_idx = text.rfind('{/* Custom Infrastructure - DB: customInfrastructure */}', start_idx, end_idx)

replacement = '''<div className=\"overflow-hidden rounded-xl border border-border bg-card shadow-sm\" id=\"specs\">
                                <div className=\"p-5 md:p-6\">
                                    <div className=\"flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between\">
                                        <div className=\"min-w-0 flex-1\">
                                            <h2 className=\"text-lg font-bold leading-snug text-foreground md:text-xl\">{specsCardTitle}</h2>
                                            <p className=\"mt-2 text-sm text-muted-foreground\">
                                                Quoted price{isNegotiablePrice ? \" (negotiable)\" : \"\"}
                                            </p>
                                            <div className=\"mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1\">
                                                {showSeatOriginalStrike && (
                                                    <span className=\"text-base text-muted-foreground line-through\">
                                                        {safeDisplay(originalPricePerSeat)}
                                                    </span>
                                                )}
                                                <span className=\"text-2xl font-bold tracking-tight text-emerald-600 md:text-3xl\">
                                                    {safeDisplay(discountedPricePerSeat ?? discountedPrice)}
                                                </span>
                                                <span className=\"text-sm font-normal text-foreground\">/ seat / month</span>
                                            </div>
                                        </div>
                                        <div
                                            className=\"inline-flex w-full max-w-full shrink-0 flex-wrap items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-100 lg:max-w-[min(100%,22rem)]\"
                                            role=\"note\"
                                        >
                                            <BadgePercent className=\"h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300\" aria-hidden />
                                            <span className=\"min-w-0 leading-snug\">
                                                Best price guaranteed - save up to {discountPct}% with{\" \"}
                                                <strong className=\"font-bold\">Buildersinfo</strong>
                                            </span>
                                            <Info className=\"h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300\" aria-label=\"More info\" />
                                        </div>
                                    </div>
                                </div>

                                <div className=\"h-px w-full bg-border\" />

                                <div className=\"grid grid-cols-1 gap-6 p-5 md:grid-cols-3 md:p-6 md:pt-5\">
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/property.svg\" alt=\"Property Type\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Property Type
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(
                                                    property.displayPropertyType ||
                                                        property.propertySubtype ||
                                                        property.propertyTypeDisplay ||
                                                        (String(property.propertyType || \"\").toLowerCase() === \"commercial\"
                                                            ? \"\"
                                                            : property.propertyType),
                                                    \"Tech Park\"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/furnshing.svg\" alt=\"Furnishing\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Furnishing level
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(property.furnishingLevel || property.furnishingStatus || property.furnishing)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/building.svg\" alt=\"Building Lease\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Building Lease
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(property.buildingLease)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className=\"h-px w-full bg-border\" />

                                <div className=\"grid grid-cols-1 gap-6 p-5 md:grid-cols-3 md:p-6 md:pt-5\">
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/property.svg\" alt=\"Min Inventory\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Min. inventory unit
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(property.minInventoryUnit)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/property.svg\" alt=\"Max Inventory\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Max. inventory unit
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(property.maxInventoryUnit)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=\"flex min-w-0 items-start gap-3\">
                                        <div className=\"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background\">
                                            <img src=\"/property-details/other-details/property.svg\" alt=\"Capacity\" className=\"h-[22px] w-[22px] object-contain drop-shadow-sm\" />
                                        </div>
                                        <div className=\"min-w-0 pt-0.5\">
                                            <p className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                                Single floor Capacity
                                                <Info className=\"h-3 w-3 shrink-0 text-sky-500\" aria-hidden />
                                            </p>
                                            <p className=\"mt-1 break-words text-sm font-bold text-foreground\">
                                                {safeDisplay(property.singleFloorCapacity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            '''

new_text = text[:start_idx] + replacement + text[end_idx:]

with open('src/app/property-details/page.js', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Success!')
