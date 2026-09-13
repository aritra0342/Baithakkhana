import { Link } from 'react-router-dom';
import { getItem } from '../data/menu';

const credits = [
  ['matir-bhar-cha', 'Kulhad Chai.jpg', 'Gannu03', 'CC BY-SA 4.0'],
  ['lebu-cha', 'Lemon tea 5.jpg', 'Gannu03', 'CC BY-SA 4.0'],
  ['malai-coffee', 'Coffee-whipped-cream-cream-beverage-aa0a422caefd26a906c74dd5e68db6d8.jpg', 'Unknown author', 'CC0'],
  ['ada-chai', 'A cup of red tea pouring from a tea pot (চায়ের পাত্র থেকে একটি কাপে ঢালা লাল চা).jpg', 'HridoyKundu', 'CC BY-SA 4.0'],
  ['singara', 'Bengali Singara.jpg', 'Sumit Surai', 'CC BY-SA 4.0'],
  ['beguni', 'Beguni (Bengali Snacks).JPG', 'Kajori.p', 'CC BY-SA 4.0'],
  ['mochar-chop', 'Mochar Chop With Kasundi and Ketchup - 1.jpg', 'Sushant savla', 'CC BY-SA 4.0'],
  ['fish-fry', 'Bengali Fish fry.JPG', 'Subhankar.c', 'CC BY-SA 4.0'],
  ['kosha-mangsho', 'Kosha Mangsho.jpg', 'Sumit Surai', 'CC BY-SA 3.0'],
  ['luchi-alurdom', 'Alur dom & luchi.jpg', 'Rocky Masum', 'CC BY-SA 4.0'],
  ['ghugni', 'Ghugni of West Bengal, made from dry white peas.jpg', 'Billjones94', 'CC BY-SA 4.0'],
  ['macher-jhol', 'Bengali Fish Thali.jpg', 'Senjuti Dey', 'CC BY-SA 4.0'],
  ['basanti-pulao', 'Basanti Pulao.jpg', 'Iamnazmussakib', 'CC0'],
  ['chingri-malai', 'Rajokio Chingri Malaikari.jpg', 'Ddhriti', 'CC BY-SA 4.0'],
  ['murgi-jhol', 'Chicken Curry Rice.jpg', 'Nilanjan Sasmal', 'CC BY-SA 4.0'],
  ['mishti-doi', 'Mishti doi.jpg', 'Anwesha394', 'CC BY-SA 4.0'],
  ['nolen-gurer-payesh', 'Bengali home made Payesh.jpg', 'Sm faysal', 'CC BY-SA 4.0'],
  ['baked-rosogolla', 'Baked Rasogolla.jpg', 'Daliadasgupta2022', 'CC BY-SA 4.0'],
  ['sandesh', 'Notun Gurer Sandesh.png', 'Sucharitabanerji', 'CC BY-SA 4.0'],
  ['aam-pora-shorbot', 'Smoked Aam Panna.jpg', 'Plantoholic', 'CC BY-SA 4.0'],
  ['bael-panna', 'Bel sarbat.jpg', 'Subhransuphotography', 'CC BY-SA 4.0'],
  ['cold-coffee', 'Homemade Cold Coffee(Indian Style)- Kolkata.jpg', 'TAPAS KUMAR HALDER', 'CC BY-SA 4.0'],
  ['chaas', 'Triangle chaas.jpg', 'ReshmaNazeerhussain', 'CC0'],
  ['about', 'Inside view of the Indian Coffee House, Kolkata 07.jpg', 'Pinakpani', 'CC BY-SA 4.0'],
] as const;

const sourceUrl = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
const licenseUrl = (license: string) => license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : license === 'CC BY-SA 3.0' ? 'https://creativecommons.org/licenses/by-sa/3.0/' : 'https://creativecommons.org/licenses/by-sa/4.0/';

export default function ImageCredits() {
  return <div className="credits-page"><span className="eyebrow">PHOTO SOURCES</span><h1>Photo credits</h1><p>These licensed photographs illustrate the menu and Bengali cafe culture. They do not depict meals made by a real Boithokkhana cafe. Photos are cropped in the interface for consistent presentation. The homepage tea scene and Mithila-inspired painting were generated for this demo.</p><div className="credits-list">{credits.map(([id, file, author, license]) => <div key={id}><strong>{getItem(id)?.en ?? 'About page'}</strong><span><a href={sourceUrl(file)} target="_blank" rel="noreferrer">{file}</a> · {author} · <a href={licenseUrl(license)} target="_blank" rel="noreferrer">{license}</a></span></div>)}</div><Link className="button button-outline" to="/menu">Back to menu</Link></div>;
}
