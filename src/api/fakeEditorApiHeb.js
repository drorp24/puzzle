import telAviv from './telAviv'
import benYehuda from './benYehuda'
import metzitzim from './metzitzim'
import urisHome from './urisHome'

const timeout = 100

const rawContent = {
  blocks: [
    {
      key: 'b1',
      text: 'בכל יום שבת בבוקר, אורי הולך לים.',
      entityRanges: [
        {
          offset: 19,
          length: 4,
          key: 'firstEntity',
        },
        {
          offset: 30,
          length: 2,
          key: 'secondEntity',
        },
        {
          offset: 4,
          length: 13,
          key: 'thirdEntity',
        },
      ],
    },

    {
      key: 'b4',
      text:
        'הוא גר בתל-אביב, וחוף הים קרוב מאד לבית של אורי שנמצא ברחוב בן-יהודה.',
      entityRanges: [
        {
          offset: 0,
          length: 3,
          key: 'firstEntity',
        },
        {
          offset: 8,
          length: 7,
          key: 'fourthEntity',
        },
        {
          offset: 36,
          length: 3,
          key: 'eighthEntity',
        },
        {
          offset: 55,
          length: 13,
          key: 'fifthEntity',
        },
      ],
    },

    {
      key: 'b7',
      text: 'כשהוא שם, אורי אוהב להאזין למוזיקה באייפון שלו.',
      entityRanges: [
        {
          offset: 10,
          length: 4,
          key: 'firstEntity',
        },
        {
          offset: 36,
          length: 6,
          key: 'sixthEntity',
        },
      ],
    },

    {
      key: 'b10',
      text: 'ורד חברתו לרוב מצטרפת.',
      entityRanges: [
        {
          offset: 0,
          length: 3,
          key: 'seventhEntity',
        },
      ],
    },
    {
      key: 'b14',
      text:
        'השלמות מושגת לא כשאין מה להוסיף אלא כשאין מה לגרוע (אנטואן דה סנט-אכזופרי).',
      entityRanges: [],
    },
    {
      key: 'b11',
      text:
        'אם אתה חושב שאתה יכול, אתה צודק! וגם אם אתה חושב שאינך יכול, אתה גם צודק!" (הנרי פורד).',
      entityRanges: [],
    },

    {
      key: 'b12',
      text: 'לאן שלא תלכו, לכו עם כל לבכם".( קונפוציוס).',
      entityRanges: [],
    },

    {
      key: 'b13',
      text:
        'אל תתנו לרעש של דעות של אחרים למנוע מהקול הפנימי שלכם להישמע". ( סטיב ג\'ובס).',
      entityRanges: [],
    },
  ],

  entityMap: {
    firstEntity: {
      willbeIgnored: 'ignored',
      type: 'PERSON',
      mutability: 'IMMUTABLE',
      data: {
        id: 'firstEntity',
        name: 'אורי',
        score: 19.99,
        subTypes: ['Young', 'Male'],
        tag: 'yes',
      },
    },
    secondEntity: {
      type: 'LOCATION',
      mutability: 'IMMUTABLE',
      data: {
        id: 'secondEntity',
        name: 'חוף מציצים',
        score: 12.99,
        subTypes: ['Area'],
        geoLocation: {
          type: 'Feature',
          properties: {
            name: 'Metzitzim',
          },
          geometry: {
            type: 'Polygon',
            coordinates: metzitzim,
          },
        },
      },
    },
    thirdEntity: {
      type: 'TIME',
      mutability: 'IMMUTABLE',
      data: {
        id: 'thirdEntity',
        name: 'שבת בבוקר',
        score: 10.99,
        subTypes: ['Day off'],
      },
    },
    fourthEntity: {
      type: 'LOCATION',
      mutability: 'IMMUTABLE',
      data: {
        id: 'fourthEntity',
        name: 'תל-אביב',
        score: 11.99,
        subTypes: ['City'],
        geoLocation: {
          type: 'Feature',
          properties: {
            name: 'TelAviv',
          },
          geometry: {
            type: 'Polygon',
            coordinates: telAviv,
          },
        },
      },
    },
    fifthEntity: {
      type: 'LOCATION',
      mutability: 'MUTABLE',
      data: {
        id: 'fifthEntity',
        name: 'בן-יהודה',
        score: 10.99,
        subTypes: ['Street'],
        geoLocation: {
          type: 'Feature',
          properties: {
            name: 'Ben Yehuda',
          },
          geometry: {
            type: 'LineString',
            coordinates: benYehuda,
          },
        },
      },
    },
    sixthEntity: {
      type: 'DEVICE',
      mutability: 'MUTABLE',
      data: {
        id: 'sixthEntity',
        name: 'אייפון',
        score: 10.99,
        subTypes: ['Communication'],
      },
    },
    seventhEntity: {
      type: 'PERSON',
      mutability: 'SEGMENTED',
      data: {
        id: 'seventhEntity',
        name: 'ורד',
        score: 8.99,
        subTypes: ['Developer', 'Female'],
      },
    },
    eighthEntity: {
      type: 'LOCATION',
      mutability: 'SEGMENTED',
      data: {
        id: 'eighthEntity',
        name: 'בית',
        score: 8.99,
        subTypes: ['Apartment'],
        geoLocation: {
          type: 'Feature',
          properties: {
            name: 'Uris home',
          },
          geometry: {
            type: 'Point',
            coordinates: urisHome,
          },
        },
      },
    },
  },
  relations: [
    // assumptions:
    // - graph is unidirectional

    {
      from: 'secondEntity',
      to: 'fourthEntity',
      type: 'in',
    },
    {
      from: 'secondEntity',
      to: 'fifthEntity',
      type: 'near',
    },
    {
      from: 'seventhEntity',
      to: 'firstEntity',
      type: 'girlfriend',
    },
    {
      from: 'eighthEntity',
      to: 'fifthEntity',
      type: 'in',
    },
  ],
}

export const getContent = () =>
  new Promise((resolve, reject) => {
    if (!rawContent) {
      return setTimeout(() => reject(new Error('Content unavailable')), timeout)
    }

    setTimeout(() => resolve(rawContent), timeout)
  })
