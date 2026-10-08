const words = ['চা', 'আড্ডা', 'গল্প', 'সিঙাড়া', 'মিষ্টি দই', 'লুচি', 'বৈঠকখানা', 'ঘুগনি', 'মালাই কফি', 'কষা মাংস'];

/**
 * A slow ticker of the words you hear across a Kolkata adda table. The list is
 * rendered twice so the translateX(-50%) loop is seamless.
 */
export function AddaMarquee() {
  const track = [...words, ...words];
  return (
    <div className="adda-marquee" aria-label="চা, আড্ডা, গল্প">
      <div className="adda-track">
        {track.map((word, index) => (
          <span key={`${word}-${index}`} aria-hidden={index >= words.length}>
            {word}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C14 7 17 10 22 12C17 14 14 17 12 22C10 17 7 14 2 12C7 10 10 7 12 2Z" fill="currentColor"/></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
