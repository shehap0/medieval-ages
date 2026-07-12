export interface Letter {
  id: string;
  author: string;
  role: string;
  sealColor: string;
  image: string;
  plateLabel: string;
  dateLine: string;
  title: string;
  body: string[];
  stain: 'ash' | 'blood' | 'water' | 'none';
}

export const letters: Letter[] = [
  {
    id: 'baldwin',
    author: 'Baldwin the Veiled',
    role: 'Keeper of the Crown',
    sealColor: 'oklch(0.72 0.10 82)',
    image: '/images/king 3.png',
    plateLabel: 'Plate XLII \u2014 Private Correspondence, Sealed',
    dateLine: 'Filed at close \u00b7 Autumn, Year of the Sixth Tally',
    title: 'On the South Window',
    body: [
      'I keep it shut not from stubbornness, though I have earned that reputation. I keep it shut because nineteen years ago an arrow came through it, meant for the crown I had just locked away. The archer was never found.',
      'Some things, once seen, cannot be unseen. I would rather sit in the dark and know the seal is whole than admire the view and wonder what I am not watching.',
      'Sleep well. I will be here when you wake.',
    ],
    stain: 'none',
  },
  {
    id: 'alexander',
    author: 'Alexander Ashborne',
    role: 'Marshal of Roads',
    sealColor: 'oklch(0.42 0.02 245)',
    image: '/images/king 2.png',
    plateLabel: 'Plate XLIII \u2014 Private Correspondence, Sealed',
    dateLine: 'Filed in transit \u00b7 early spring, Year of the Sixth Tally',
    title: 'On the Bridge at Osterfold',
    body: [
      'They will say I burned it. They will be right. But what the ledgers do not record is that I stood on the far bank first, counted every face that had crossed, and waited until the sixty-seventh, a boy no older than your son, reached my side. Then I lit the torch myself.',
      'Roads are not stone. Roads are decisions, and they weigh more than any bridge I have built or burned.',
    ],
    stain: 'water',
  },
  {
    id: 'aleks',
    author: 'Aleks the Gold-Tongued',
    role: 'Voice of the Court',
    sealColor: 'var(--ember)',
    image: '/images/kind.jpeg',
    plateLabel: 'Plate XLIV \u2014 Private Correspondence, Sealed',
    dateLine: 'Filed at the third bell \u00b7 winter, Year of the Sixth Tally',
    title: 'On What I Said to House Aedran',
    body: [
      'I told them you would not march. I told them with such conviction that they thanked me for my honesty. They withdrew their banners and sent grain instead. What I did not tell them is that I never asked you first.',
      'I gambled your name, your honour, on my reading of your character. If I was wrong, this letter burns before dawn. If I was right, you will never see it.',
      'Either way, I sleep poorly.',
    ],
    stain: 'ash',
  },
  {
    id: 'ser-rowan',
    author: 'Ser Rowan Vale',
    role: 'Silent Captain',
    sealColor: 'oklch(0.18 0.01 250)',
    image: '/images/roman.jpeg',
    plateLabel: 'Plate XLV \u2014 Private Correspondence, Sealed',
    dateLine: 'Filed at the last watch \u00b7 year-end, Year of the Sixth Tally',
    title: 'On the Names I Remember',
    body: [
      'They think I am silent because I have forgotten. The truth is worse. I remember every name, in order, exactly as they fell. I recite them each dawn before the first bell. Forty-seven men under my command, forty-seven names I carry like a second weight of armour.',
      'When the torches burn low, I do not ask for a song. I ask for forgiveness. The dead do not answer. I do not expect them to.',
    ],
    stain: 'blood',
  },
];
