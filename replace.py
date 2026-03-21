import sys

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = [
        ('bg-[#0a0a0a]', 'bg-slate-50'),
        ('text-slate-200', 'text-slate-800'),
        ('text-slate-300', 'text-slate-700'),
        ('text-slate-400', 'text-slate-500'),
        ('text-slate-500', 'text-slate-400'),
        ('text-white', 'text-slate-900'),
        ('bg-slate-800', 'bg-white'),
        ('bg-slate-900', 'bg-slate-100'),
        ('bg-slate-700', 'bg-slate-100'),
        ('border-slate-700', 'border-slate-200'),
        ('border-slate-600', 'border-slate-300'),
        ('bg-black/20', 'bg-slate-100/50'),
        ('bg-black/30', 'bg-slate-200/50'),
        ('bg-black/40', 'bg-slate-200/80'),
        ('bg-black/60', 'bg-slate-900/40'),
        ('border-white/5', 'border-slate-200'),
        ('border-white/10', 'border-slate-300'),
        ('border-white/20', 'border-slate-300'),
        ('hover:bg-white/10', 'hover:bg-slate-200/50'),
        ('hover:bg-white/5', 'hover:bg-slate-100/50'),
        ('bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_50%)]', 'bg-[radial-gradient(circle_at_50%_0%,_#e2e8f0_0%,_transparent_50%)]'),
        ('text-emerald-50', 'text-slate-900'),
        ('text-sky-400', 'text-sky-600'),
        ('text-sky-300', 'text-sky-700'),
        ('text-sky-200', 'text-sky-800'),
        ('text-emerald-400', 'text-emerald-600'),
        ('text-emerald-100', 'text-emerald-800'),
        ('text-amber-400', 'text-amber-600'),
        ('text-amber-300', 'text-amber-700'),
        ('text-red-400', 'text-red-600'),
        ('text-red-300', 'text-red-700'),
        ('text-red-200', 'text-red-800'),
        ('bg-black/10', 'bg-slate-100/30'),
        ('bg-sky-700', 'bg-sky-600'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Some manual fixes for text-white that should remain white
    content = content.replace('bg-sky-600 text-slate-900', 'bg-sky-600 text-white')
    content = content.replace('bg-red-500 hover:bg-red-600 text-slate-900', 'bg-red-500 hover:bg-red-600 text-white')
    content = content.replace('bg-gradient-to-tr from-sky-600 to-emerald-500 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] flex items-center justify-center text-slate-900', 'bg-gradient-to-tr from-sky-600 to-emerald-500 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] flex items-center justify-center text-white')
    content = content.replace('bg-red-500/50 text-slate-900', 'bg-red-500/50 text-white')

    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('App.tsx')
