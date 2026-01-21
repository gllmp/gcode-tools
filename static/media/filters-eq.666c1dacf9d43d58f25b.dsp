import("stdfaust.lib");

/*
declare name "equalizer";
import("stdfaust.lib");
peakeq (f) = hgroup("band %f", fi.peak_eq_cq(level,f,Q)
					with {
					  level = vslider("level[unit:dB][style:knob]", 0, -70, 12, 1);
					  Q = vslider("Q[style:knob]", 1, 1, 100, 0.01);
					});
process = no.noise : hgroup("Equalizer", seq(i, 5, peakeq(500+500*i)));
  
filters = seq(i,2,someFilter(i))
with{
  someFilter(i) = filter(a,b,c(i))
  with{
    freq = hslider("LFOFreq%i",...);
    a = LFO(freq)*i;
    b = LFO(freq)*i*2;
    c(0) = 1;
    c(1) = 2;
  };
};
*/

/*
nBands = 8;
filterBank(N) = hgroup("Filter Bank",seq(i,N,peakeq(i)))
with {
    peakeq(j) = vgroup("[%j]Band %a",fi.peak_eq(l,f,b))
    with {
        a = j+1;
        l = vslider("[2]Level[unit:db]",0,-70,12,0.01) : si.smoo;
        f = nentry("[1]Freq",(80+(1000*8/N*(j+1)-80)),20,20000,0.01) : si.smoo;
        b = f/hslider("[0]Q[style:knob]",1,1,50,0.01) : si.smoo;
    };
};
// process = filterBank(nBands);
*/

/*
lfoFreq = hslider("LFO Frequency[style:knob]",10,0.1,20,0.01);
 lfoDepth = hslider("LFO Depth[style:knob]",500,1,10000,1);
LFO(freq) =  os.osc(lfoFreq)*lfoDepth + freq : max(30);

nBands = 4;
filters(N) = hgroup("Filter Bank",seq(i,N,peakeq(i)))
with{
  peakeq(i) = vgroup("[%i]Band %index",fi.peak_eq(l,f,b))
  with{
	index = i+1;
    // freq = hslider("LFOFreq%index",2000,50,10000,0.1);
	freq = 1000 * index;
    l = vslider("Level[unit:db]",0,-70,12,0.01) : si.smoo;
    f = nentry("Freq",1000*index,20,20000,1) : si.smoo;
    b = LFO(freq)/hslider("Q[style:knob]",1,1,50,0.01) : si.smoo;
  };
};
*/

waveGenerator = hgroup("[0]Wave Generator",no.noise,os.triangle(freq),os.square(freq),os.sawtooth(freq) : ba.selectn(4,wave)) : _ <:_,_,_
with{
  wave = nentry("[0]Waveform",3,0,3,1);
  freq = hslider("[1]freq",440,50,2000,0.01);
};

filters = hgroup("[1]Filter", fi.resonlp(resFreq,q,1), fi.resonhp(resFreq,q,1), fi.resonbp(resFreq,q,1) : ba.selectn(3,filters)) : _
with{
  filters = nentry("[0]Filter Type", 0, 0, 2, 1);
  ctFreq = hslider("[1]Cutoff Frequency[style:knob]",2000,50,10000,0.1);
  q = hslider("[2]Q[style:knob]",5,1,30,0.1);
  lfoFreq = hslider("[3]LFO Frequency[style:knob]",10,0.1,20,0.01);
  lfoDepth = hslider("[4]LFO Depth[style:knob]",500,1,10000,1);
  resFreq = os.osc(lfoFreq)*lfoDepth + ctFreq : max(30);
};

lfoFreq = hslider("LFO Frequency[style:knob]",10,0.1,20,0.01);
lfoDepth = hslider("LFO Depth[style:knob]",500,1,10000,1);
LFO(freq) =  os.osc(lfoFreq)*lfoDepth + freq : max(30);

nBands = 4;
eq(N) = hgroup("Peak EQ",seq(i,N,peakeq(i)))
with{
  peakeq(i) = vgroup("[%i]Band %index",fi.peak_eq(l,f,b))
  with{
	index = i+1;
    // freq = hslider("LFOFreq%index",2000,50,10000,0.1);
	freq = 1000 * index;
    l = vslider("[0]Level[unit:db]",0,-70,12,0.01) : si.smoo;
    f = nentry("[1]Peak Frequency[unit:Hz]",freq,20,20000,1) : si.smoo;
    b = f/hslider("[2]Bandwidth[style:knob][unit:Hz]",1,1,50,0.01) : si.smoo;
  };
};

subtractive = waveGenerator : filters : eq(nBands);

// subtractive = waveGenerator : filters(nBands);
envelope = hgroup("[2]Envelope",en.adsr(attack,decay,sustain,release,gate)*gain*0.3)
with{
  attack = hslider("[0]Attack[style:knob]",50,1,1000,1)*0.001;
  decay = hslider("[1]Decay[style:knob]",50,1,1000,1)*0.001;
  sustain = hslider("[2]Sustain[style:knob]",0.8,0.01,1,1);
  release = hslider("[3]Release[style:knob]",50,1,1000,1)*0.001;
  gain = hslider("[4]gain[style:knob]",1,0,1,0.01);
  gate = button("[5]gate");
};
process = vgroup("Subtractive Synthesizer",subtractive*envelope);
