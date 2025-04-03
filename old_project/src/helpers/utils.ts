
import { alertController } from '@ionic/core';


export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export function limit(str: string, len: number): string {
  if (str.length > len) {
    return str.substr(0, len) + '...';
  }
  return str;
}

export function touchSupported() {
  return ('ontouchstart' in window);
}

export function canObserveIntersections() {
  return ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
}

export function stripHtml(html) {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function loadJSON(fileUrl: string): Promise<object> {
  return new Promise((resolve, reject) => {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', fileUrl, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === 200) {
        try {
          resolve(JSON.parse(xobj.responseText));
        } catch (e) {
          reject(e);
        }
      }
    };
    xobj.send(null);
  });
}

export function loadLocalFileJson(file: Blob): Promise<object> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonResult = JSON.parse(e.target.result.toString());
        resolve(jsonResult);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

export function scrollTo(element, to, duration) {
  var start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 20;

  var animateScroll = function () {
    currentTime += increment;
    var val = easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}

export function chunk(arr: Array<any>, size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function help(msg: string) {
  const alert = await alertController.create({
    cssClass: 'help-alert',
    message: msg,
    buttons: ['Got it']
  });
  await alert.present();
}

export interface IInfluencer {
  id: string;
  name: string;
  points: number;
  profile: string;
}

export interface IResponse {
  id: string;
  votes?: number;
  posted?: number;
  userId?: string;
  response: string;
}


export interface IQuestion {
  id: string;
  posted?: number;
  userId?: string;
  public?: boolean;
  votes?: number;
  rephrase?: IQuestion[];
  question: string;
  responses?: IResponse[];
}

export interface IArgument {
  id: string;
  claim: string;
  score: number;
}

interface IClaim extends IResponse {
  score?: number;
}

export interface ISymstorm extends IQuestion {
  started?: number;
  activity?: number;
  daysLeft?: number;
  responses: IClaim[];
}

const questions = [
  'Should the value of free speech apply equally to hate speech?',
  "Should hydroponic produce be labeled organic?",
  "Has Big Tech become too big?",
  "What is the best way to put more electric cars on the road?",
  "Should all legal internet content be treated equally by internet service providers?",
  "Is a global tax a good idea?",
  "Should kids be required to wear masks in school?",
  "Should police be held more accountable for excessive use of force?"
]


// https://app.json-generator.com/fqJu1Idd0yI6
