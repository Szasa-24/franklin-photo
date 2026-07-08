const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const target = `                    <div>
                      <h3 className="font-medium text-white">{school.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1">Létrehozva: {new Date(school.createdAt).toLocaleDateString()}</p>
                    </div>`;

const replacement = `                    <div>
                      <h3 className="font-medium text-white">{school.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-neutral-500">
                          Jelszó: {visiblePasswords[school.id] ? (school.passwordPlain || 'N/A') : '••••••••'}
                        </p>
                        <button 
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [school.id]: !prev[school.id] }))}
                          className="text-neutral-500 hover:text-white transition-colors"
                        >
                          {visiblePasswords[school.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">Létrehozva: {new Date(school.createdAt).toLocaleDateString()}</p>
                    </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('app/admin/page.tsx', code);
