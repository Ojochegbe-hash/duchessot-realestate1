const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const importReplacement = `import { Menu, X, Building, ChevronDown } from 'lucide-react';`;
content = content.replace(`import { Menu, X, Building } from 'lucide-react';`, importReplacement);

const oldDesktopNav = `          {/* Desktop Nav */}
          <nav className=\"hidden md:flex items-center gap-8\">
            <Link to=\"/\" className=\"text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">Home</Link>
            <Link to=\"/properties\" className=\"text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">Properties</Link>
            <Link to=\"/contact\" className=\"text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">Contact</Link>
            <Button asChild className=\"bg-primary hover:bg-primary-light text-white transition-colors rounded-full px-6\">
              <Link to=\"/properties\">Find a Home</Link>
            </Button>
          </nav>`;

const newDesktopNav = `          {/* Desktop Nav */}
          <nav className=\"hidden md:flex items-center gap-8\">
            <Link to=\"/\" className=\"text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">Home</Link>
            
            <div className=\"relative group\">
              <button className=\"flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">
                Properties <ChevronDown className=\"w-4 h-4\" />
              </button>
              <div className=\"absolute top-full left-0 mt-2 w-48 bg-white border border-stone-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0\">
                <div className=\"p-2 flex flex-col gap-1\">
                  <Link to=\"/properties\" className=\"px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors\">All Properties</Link>
                  <Link to=\"/properties?type=Rent\" className=\"px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors\">For Rent</Link>
                  <Link to=\"/properties?type=Sell\" className=\"px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors\">For Sale</Link>
                  <Link to=\"/properties?type=Short Let\" className=\"px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors\">Short Lets</Link>
                </div>
              </div>
            </div>

            <Link to=\"/contact\" className=\"text-sm font-semibold text-stone-600 hover:text-primary transition-colors\">Contact</Link>
            <Button asChild className=\"bg-primary hover:bg-primary-light text-white transition-colors rounded-full px-6\">
              <Link to=\"/properties\">Find a Home</Link>
            </Button>
          </nav>`;

content = content.replace(oldDesktopNav, newDesktopNav);
fs.writeFileSync('src/components/layout/Navbar.tsx', content);
console.log('Navbar updated with dropdown');
