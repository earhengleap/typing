const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const targetHeaderStart = content.indexOf('<header className="relative w-full max-w-5xl mx-auto flex items-center justify-between pt-8 pb-4 z-10 px-4 md:px-0">');
if (targetHeaderStart === -1) {
    console.error('Header not found');
    process.exit(1);
}

const targetHeaderEnd = content.indexOf('</header>', targetHeaderStart) + '</header>'.length;

const newHeader = `            <header className="relative w-full max-w-5xl mx-auto flex items-center pt-8 pb-4 z-10 px-4 md:px-0">
                <div className="flex w-full items-center">
                    <div className="flex items-center gap-2 group flex-1">
                        <Type className="w-8 h-8 transition-transform group-hover:scale-110" style={{ color: activeTheme.primary }} />
                        <h1 className="text-[32px] tracking-tight font-bold ml-1 relative" style={{ color: activeTheme.textDim }}>
                            <span style={{ color: activeTheme.text }}>type</span>flow
                        </h1>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <nav className="hidden md:flex items-center space-x-2" style={{ color: activeTheme.textDim }}>
                            <button
                                onClick={() => inputRef.current?.focus()}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group text-sm font-bold"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = activeTheme.text;
                                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = activeTheme.textDim;
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                <KeyboardIcon size={16} />
                                <span className="opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 -bottom-8 rounded bg-black/50 px-2 py-1 text-xs whitespace-nowrap transition-opacity hidden md:block w-fit text-white z-20">
                                    test
                                </span>
                            </button>
                            <button
                                onClick={() => setShowCommandPalette(true)}
                                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group text-sm font-bold ml-4"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = activeTheme.text;
                                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = activeTheme.textDim;
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                <Search size={16} />
                                <span className="opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 -bottom-8 rounded bg-black/50 px-2 py-1 text-xs whitespace-nowrap transition-opacity hidden md:block w-fit text-white z-20">
                                    cmd palette <span className="font-mono bg-white/20 px-1 rounded ml-1">esc</span>
                                </span>
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 justify-end flex-1 z-20">
                        <UserMenu />
                    </div>
                </div>
            </header>`;

content = content.substring(0, targetHeaderStart) + newHeader + content.substring(targetHeaderEnd);
fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully updated UserMenu header');
