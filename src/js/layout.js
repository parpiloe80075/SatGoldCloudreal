const nav=[["Features","/src/pages/features.html"],["Pricing","/src/pages/pricing.html"],["Contact","/src/pages/contact.html"]];
export function mountLayout(){
 document.body.insertAdjacentHTML("afterbegin",`<header class="site"><div class="wrap"><a class="logo" href="/">SatGold <b>Cloud</b></a><nav aria-label="Main">${nav.map(([t,h])=>`<a href="${h}">${t}</a>`).join("")}<a href="/src/pages/login.html">Log in</a><a class="btn" href="/src/pages/register.html">Register your school</a></nav></div></header>`);
 document.body.insertAdjacentHTML("beforeend",`<footer class="site"><div class="wrap"><strong>SatGold Cloud</strong><p>support.satgoldcloud@gmail.com | 09138836682 | 07081495536</p><p>Legal policies are drafts awaiting legal review.</p></div></footer>`);
}
