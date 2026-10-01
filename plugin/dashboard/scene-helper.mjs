var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/jpeg-js/lib/encoder.js
var require_encoder = __commonJS({
  "node_modules/jpeg-js/lib/encoder.js"(exports, module) {
    var btoa = btoa || function(buf) {
      return Buffer.from(buf).toString("base64");
    };
    function JPEGEncoder(quality) {
      var self = this;
      var fround = Math.round;
      var ffloor = Math.floor;
      var YTable = new Array(64);
      var UVTable = new Array(64);
      var fdtbl_Y = new Array(64);
      var fdtbl_UV = new Array(64);
      var YDC_HT;
      var UVDC_HT;
      var YAC_HT;
      var UVAC_HT;
      var bitcode = new Array(65535);
      var category = new Array(65535);
      var outputfDCTQuant = new Array(64);
      var DU = new Array(64);
      var byteout = [];
      var bytenew = 0;
      var bytepos = 7;
      var YDU = new Array(64);
      var UDU = new Array(64);
      var VDU = new Array(64);
      var clt = new Array(256);
      var RGB_YUV_TABLE = new Array(2048);
      var currentQuality;
      var ZigZag = [
        0,
        1,
        5,
        6,
        14,
        15,
        27,
        28,
        2,
        4,
        7,
        13,
        16,
        26,
        29,
        42,
        3,
        8,
        12,
        17,
        25,
        30,
        41,
        43,
        9,
        11,
        18,
        24,
        31,
        40,
        44,
        53,
        10,
        19,
        23,
        32,
        39,
        45,
        52,
        54,
        20,
        22,
        33,
        38,
        46,
        51,
        55,
        60,
        21,
        34,
        37,
        47,
        50,
        56,
        59,
        61,
        35,
        36,
        48,
        49,
        57,
        58,
        62,
        63
      ];
      var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
      var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      var std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125];
      var std_ac_luminance_values = [
        1,
        2,
        3,
        0,
        4,
        17,
        5,
        18,
        33,
        49,
        65,
        6,
        19,
        81,
        97,
        7,
        34,
        113,
        20,
        50,
        129,
        145,
        161,
        8,
        35,
        66,
        177,
        193,
        21,
        82,
        209,
        240,
        36,
        51,
        98,
        114,
        130,
        9,
        10,
        22,
        23,
        24,
        25,
        26,
        37,
        38,
        39,
        40,
        41,
        42,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        225,
        226,
        227,
        228,
        229,
        230,
        231,
        232,
        233,
        234,
        241,
        242,
        243,
        244,
        245,
        246,
        247,
        248,
        249,
        250
      ];
      var std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
      var std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      var std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119];
      var std_ac_chrominance_values = [
        0,
        1,
        2,
        3,
        17,
        4,
        5,
        33,
        49,
        6,
        18,
        65,
        81,
        7,
        97,
        113,
        19,
        34,
        50,
        129,
        8,
        20,
        66,
        145,
        161,
        177,
        193,
        9,
        35,
        51,
        82,
        240,
        21,
        98,
        114,
        209,
        10,
        22,
        36,
        52,
        225,
        37,
        241,
        23,
        24,
        25,
        26,
        38,
        39,
        40,
        41,
        42,
        53,
        54,
        55,
        56,
        57,
        58,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        226,
        227,
        228,
        229,
        230,
        231,
        232,
        233,
        234,
        242,
        243,
        244,
        245,
        246,
        247,
        248,
        249,
        250
      ];
      function initQuantTables(sf) {
        var YQT = [
          16,
          11,
          10,
          16,
          24,
          40,
          51,
          61,
          12,
          12,
          14,
          19,
          26,
          58,
          60,
          55,
          14,
          13,
          16,
          24,
          40,
          57,
          69,
          56,
          14,
          17,
          22,
          29,
          51,
          87,
          80,
          62,
          18,
          22,
          37,
          56,
          68,
          109,
          103,
          77,
          24,
          35,
          55,
          64,
          81,
          104,
          113,
          92,
          49,
          64,
          78,
          87,
          103,
          121,
          120,
          101,
          72,
          92,
          95,
          98,
          112,
          100,
          103,
          99
        ];
        for (var i = 0; i < 64; i++) {
          var t = ffloor((YQT[i] * sf + 50) / 100);
          if (t < 1) {
            t = 1;
          } else if (t > 255) {
            t = 255;
          }
          YTable[ZigZag[i]] = t;
        }
        var UVQT = [
          17,
          18,
          24,
          47,
          99,
          99,
          99,
          99,
          18,
          21,
          26,
          66,
          99,
          99,
          99,
          99,
          24,
          26,
          56,
          99,
          99,
          99,
          99,
          99,
          47,
          66,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99,
          99
        ];
        for (var j = 0; j < 64; j++) {
          var u = ffloor((UVQT[j] * sf + 50) / 100);
          if (u < 1) {
            u = 1;
          } else if (u > 255) {
            u = 255;
          }
          UVTable[ZigZag[j]] = u;
        }
        var aasf = [
          1,
          1.387039845,
          1.306562965,
          1.175875602,
          1,
          0.785694958,
          0.5411961,
          0.275899379
        ];
        var k = 0;
        for (var row = 0; row < 8; row++) {
          for (var col = 0; col < 8; col++) {
            fdtbl_Y[k] = 1 / (YTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
            fdtbl_UV[k] = 1 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
            k++;
          }
        }
      }
      function computeHuffmanTbl(nrcodes, std_table) {
        var codevalue = 0;
        var pos_in_table = 0;
        var HT = new Array();
        for (var k = 1; k <= 16; k++) {
          for (var j = 1; j <= nrcodes[k]; j++) {
            HT[std_table[pos_in_table]] = [];
            HT[std_table[pos_in_table]][0] = codevalue;
            HT[std_table[pos_in_table]][1] = k;
            pos_in_table++;
            codevalue++;
          }
          codevalue *= 2;
        }
        return HT;
      }
      function initHuffmanTbl() {
        YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
        UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
        YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
        UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
      }
      function initCategoryNumber() {
        var nrlower = 1;
        var nrupper = 2;
        for (var cat = 1; cat <= 15; cat++) {
          for (var nr = nrlower; nr < nrupper; nr++) {
            category[32767 + nr] = cat;
            bitcode[32767 + nr] = [];
            bitcode[32767 + nr][1] = cat;
            bitcode[32767 + nr][0] = nr;
          }
          for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
            category[32767 + nrneg] = cat;
            bitcode[32767 + nrneg] = [];
            bitcode[32767 + nrneg][1] = cat;
            bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
          }
          nrlower <<= 1;
          nrupper <<= 1;
        }
      }
      function initRGBYUVTable() {
        for (var i = 0; i < 256; i++) {
          RGB_YUV_TABLE[i] = 19595 * i;
          RGB_YUV_TABLE[i + 256 >> 0] = 38470 * i;
          RGB_YUV_TABLE[i + 512 >> 0] = 7471 * i + 32768;
          RGB_YUV_TABLE[i + 768 >> 0] = -11059 * i;
          RGB_YUV_TABLE[i + 1024 >> 0] = -21709 * i;
          RGB_YUV_TABLE[i + 1280 >> 0] = 32768 * i + 8421375;
          RGB_YUV_TABLE[i + 1536 >> 0] = -27439 * i;
          RGB_YUV_TABLE[i + 1792 >> 0] = -5329 * i;
        }
      }
      function writeBits(bs) {
        var value = bs[0];
        var posval = bs[1] - 1;
        while (posval >= 0) {
          if (value & 1 << posval) {
            bytenew |= 1 << bytepos;
          }
          posval--;
          bytepos--;
          if (bytepos < 0) {
            if (bytenew == 255) {
              writeByte(255);
              writeByte(0);
            } else {
              writeByte(bytenew);
            }
            bytepos = 7;
            bytenew = 0;
          }
        }
      }
      function writeByte(value) {
        byteout.push(value);
      }
      function writeWord(value) {
        writeByte(value >> 8 & 255);
        writeByte(value & 255);
      }
      function fDCTQuant(data, fdtbl) {
        var d0, d1, d2, d3, d4, d5, d6, d7;
        var dataOff = 0;
        var i;
        var I8 = 8;
        var I64 = 64;
        for (i = 0; i < I8; ++i) {
          d0 = data[dataOff];
          d1 = data[dataOff + 1];
          d2 = data[dataOff + 2];
          d3 = data[dataOff + 3];
          d4 = data[dataOff + 4];
          d5 = data[dataOff + 5];
          d6 = data[dataOff + 6];
          d7 = data[dataOff + 7];
          var tmp0 = d0 + d7;
          var tmp7 = d0 - d7;
          var tmp1 = d1 + d6;
          var tmp6 = d1 - d6;
          var tmp2 = d2 + d5;
          var tmp5 = d2 - d5;
          var tmp3 = d3 + d4;
          var tmp4 = d3 - d4;
          var tmp10 = tmp0 + tmp3;
          var tmp13 = tmp0 - tmp3;
          var tmp11 = tmp1 + tmp2;
          var tmp12 = tmp1 - tmp2;
          data[dataOff] = tmp10 + tmp11;
          data[dataOff + 4] = tmp10 - tmp11;
          var z1 = (tmp12 + tmp13) * 0.707106781;
          data[dataOff + 2] = tmp13 + z1;
          data[dataOff + 6] = tmp13 - z1;
          tmp10 = tmp4 + tmp5;
          tmp11 = tmp5 + tmp6;
          tmp12 = tmp6 + tmp7;
          var z5 = (tmp10 - tmp12) * 0.382683433;
          var z2 = 0.5411961 * tmp10 + z5;
          var z4 = 1.306562965 * tmp12 + z5;
          var z3 = tmp11 * 0.707106781;
          var z11 = tmp7 + z3;
          var z13 = tmp7 - z3;
          data[dataOff + 5] = z13 + z2;
          data[dataOff + 3] = z13 - z2;
          data[dataOff + 1] = z11 + z4;
          data[dataOff + 7] = z11 - z4;
          dataOff += 8;
        }
        dataOff = 0;
        for (i = 0; i < I8; ++i) {
          d0 = data[dataOff];
          d1 = data[dataOff + 8];
          d2 = data[dataOff + 16];
          d3 = data[dataOff + 24];
          d4 = data[dataOff + 32];
          d5 = data[dataOff + 40];
          d6 = data[dataOff + 48];
          d7 = data[dataOff + 56];
          var tmp0p2 = d0 + d7;
          var tmp7p2 = d0 - d7;
          var tmp1p2 = d1 + d6;
          var tmp6p2 = d1 - d6;
          var tmp2p2 = d2 + d5;
          var tmp5p2 = d2 - d5;
          var tmp3p2 = d3 + d4;
          var tmp4p2 = d3 - d4;
          var tmp10p2 = tmp0p2 + tmp3p2;
          var tmp13p2 = tmp0p2 - tmp3p2;
          var tmp11p2 = tmp1p2 + tmp2p2;
          var tmp12p2 = tmp1p2 - tmp2p2;
          data[dataOff] = tmp10p2 + tmp11p2;
          data[dataOff + 32] = tmp10p2 - tmp11p2;
          var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
          data[dataOff + 16] = tmp13p2 + z1p2;
          data[dataOff + 48] = tmp13p2 - z1p2;
          tmp10p2 = tmp4p2 + tmp5p2;
          tmp11p2 = tmp5p2 + tmp6p2;
          tmp12p2 = tmp6p2 + tmp7p2;
          var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
          var z2p2 = 0.5411961 * tmp10p2 + z5p2;
          var z4p2 = 1.306562965 * tmp12p2 + z5p2;
          var z3p2 = tmp11p2 * 0.707106781;
          var z11p2 = tmp7p2 + z3p2;
          var z13p2 = tmp7p2 - z3p2;
          data[dataOff + 40] = z13p2 + z2p2;
          data[dataOff + 24] = z13p2 - z2p2;
          data[dataOff + 8] = z11p2 + z4p2;
          data[dataOff + 56] = z11p2 - z4p2;
          dataOff++;
        }
        var fDCTQuant2;
        for (i = 0; i < I64; ++i) {
          fDCTQuant2 = data[i] * fdtbl[i];
          outputfDCTQuant[i] = fDCTQuant2 > 0 ? fDCTQuant2 + 0.5 | 0 : fDCTQuant2 - 0.5 | 0;
        }
        return outputfDCTQuant;
      }
      function writeAPP0() {
        writeWord(65504);
        writeWord(16);
        writeByte(74);
        writeByte(70);
        writeByte(73);
        writeByte(70);
        writeByte(0);
        writeByte(1);
        writeByte(1);
        writeByte(0);
        writeWord(1);
        writeWord(1);
        writeByte(0);
        writeByte(0);
      }
      function writeAPP1(exifBuffer) {
        if (!exifBuffer) return;
        writeWord(65505);
        if (exifBuffer[0] === 69 && exifBuffer[1] === 120 && exifBuffer[2] === 105 && exifBuffer[3] === 102) {
          writeWord(exifBuffer.length + 2);
        } else {
          writeWord(exifBuffer.length + 5 + 2);
          writeByte(69);
          writeByte(120);
          writeByte(105);
          writeByte(102);
          writeByte(0);
        }
        for (var i = 0; i < exifBuffer.length; i++) {
          writeByte(exifBuffer[i]);
        }
      }
      function writeSOF0(width, height) {
        writeWord(65472);
        writeWord(17);
        writeByte(8);
        writeWord(height);
        writeWord(width);
        writeByte(3);
        writeByte(1);
        writeByte(17);
        writeByte(0);
        writeByte(2);
        writeByte(17);
        writeByte(1);
        writeByte(3);
        writeByte(17);
        writeByte(1);
      }
      function writeDQT() {
        writeWord(65499);
        writeWord(132);
        writeByte(0);
        for (var i = 0; i < 64; i++) {
          writeByte(YTable[i]);
        }
        writeByte(1);
        for (var j = 0; j < 64; j++) {
          writeByte(UVTable[j]);
        }
      }
      function writeDHT() {
        writeWord(65476);
        writeWord(418);
        writeByte(0);
        for (var i = 0; i < 16; i++) {
          writeByte(std_dc_luminance_nrcodes[i + 1]);
        }
        for (var j = 0; j <= 11; j++) {
          writeByte(std_dc_luminance_values[j]);
        }
        writeByte(16);
        for (var k = 0; k < 16; k++) {
          writeByte(std_ac_luminance_nrcodes[k + 1]);
        }
        for (var l = 0; l <= 161; l++) {
          writeByte(std_ac_luminance_values[l]);
        }
        writeByte(1);
        for (var m = 0; m < 16; m++) {
          writeByte(std_dc_chrominance_nrcodes[m + 1]);
        }
        for (var n = 0; n <= 11; n++) {
          writeByte(std_dc_chrominance_values[n]);
        }
        writeByte(17);
        for (var o = 0; o < 16; o++) {
          writeByte(std_ac_chrominance_nrcodes[o + 1]);
        }
        for (var p = 0; p <= 161; p++) {
          writeByte(std_ac_chrominance_values[p]);
        }
      }
      function writeCOM(comments) {
        if (typeof comments === "undefined" || comments.constructor !== Array) return;
        comments.forEach((e) => {
          if (typeof e !== "string") return;
          writeWord(65534);
          var l = e.length;
          writeWord(l + 2);
          var i;
          for (i = 0; i < l; i++)
            writeByte(e.charCodeAt(i));
        });
      }
      function writeSOS() {
        writeWord(65498);
        writeWord(12);
        writeByte(3);
        writeByte(1);
        writeByte(0);
        writeByte(2);
        writeByte(17);
        writeByte(3);
        writeByte(17);
        writeByte(0);
        writeByte(63);
        writeByte(0);
      }
      function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
        var EOB = HTAC[0];
        var M16zeroes = HTAC[240];
        var pos;
        var I16 = 16;
        var I63 = 63;
        var I64 = 64;
        var DU_DCT = fDCTQuant(CDU, fdtbl);
        for (var j = 0; j < I64; ++j) {
          DU[ZigZag[j]] = DU_DCT[j];
        }
        var Diff = DU[0] - DC;
        DC = DU[0];
        if (Diff == 0) {
          writeBits(HTDC[0]);
        } else {
          pos = 32767 + Diff;
          writeBits(HTDC[category[pos]]);
          writeBits(bitcode[pos]);
        }
        var end0pos = 63;
        for (; end0pos > 0 && DU[end0pos] == 0; end0pos--) {
        }
        ;
        if (end0pos == 0) {
          writeBits(EOB);
          return DC;
        }
        var i = 1;
        var lng;
        while (i <= end0pos) {
          var startpos = i;
          for (; DU[i] == 0 && i <= end0pos; ++i) {
          }
          var nrzeroes = i - startpos;
          if (nrzeroes >= I16) {
            lng = nrzeroes >> 4;
            for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
              writeBits(M16zeroes);
            nrzeroes = nrzeroes & 15;
          }
          pos = 32767 + DU[i];
          writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
          writeBits(bitcode[pos]);
          i++;
        }
        if (end0pos != I63) {
          writeBits(EOB);
        }
        return DC;
      }
      function initCharLookupTable() {
        var sfcc = String.fromCharCode;
        for (var i = 0; i < 256; i++) {
          clt[i] = sfcc(i);
        }
      }
      this.encode = function(image, quality2) {
        var time_start = (/* @__PURE__ */ new Date()).getTime();
        if (quality2) setQuality(quality2);
        byteout = new Array();
        bytenew = 0;
        bytepos = 7;
        writeWord(65496);
        writeAPP0();
        writeCOM(image.comments);
        writeAPP1(image.exifBuffer);
        writeDQT();
        writeSOF0(image.width, image.height);
        writeDHT();
        writeSOS();
        var DCY = 0;
        var DCU = 0;
        var DCV = 0;
        bytenew = 0;
        bytepos = 7;
        this.encode.displayName = "_encode_";
        var imageData = image.data;
        var width = image.width;
        var height = image.height;
        var quadWidth = width * 4;
        var tripleWidth = width * 3;
        var x, y = 0;
        var r, g, b;
        var start, p, col, row, pos;
        while (y < height) {
          x = 0;
          while (x < quadWidth) {
            start = quadWidth * y + x;
            p = start;
            col = -1;
            row = 0;
            for (pos = 0; pos < 64; pos++) {
              row = pos >> 3;
              col = (pos & 7) * 4;
              p = start + row * quadWidth + col;
              if (y + row >= height) {
                p -= quadWidth * (y + 1 + row - height);
              }
              if (x + col >= quadWidth) {
                p -= x + col - quadWidth + 4;
              }
              r = imageData[p++];
              g = imageData[p++];
              b = imageData[p++];
              YDU[pos] = (RGB_YUV_TABLE[r] + RGB_YUV_TABLE[g + 256 >> 0] + RGB_YUV_TABLE[b + 512 >> 0] >> 16) - 128;
              UDU[pos] = (RGB_YUV_TABLE[r + 768 >> 0] + RGB_YUV_TABLE[g + 1024 >> 0] + RGB_YUV_TABLE[b + 1280 >> 0] >> 16) - 128;
              VDU[pos] = (RGB_YUV_TABLE[r + 1280 >> 0] + RGB_YUV_TABLE[g + 1536 >> 0] + RGB_YUV_TABLE[b + 1792 >> 0] >> 16) - 128;
            }
            DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
            DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
            DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
            x += 32;
          }
          y += 8;
        }
        if (bytepos >= 0) {
          var fillbits = [];
          fillbits[1] = bytepos + 1;
          fillbits[0] = (1 << bytepos + 1) - 1;
          writeBits(fillbits);
        }
        writeWord(65497);
        if (typeof module === "undefined") return new Uint8Array(byteout);
        return Buffer.from(byteout);
        var jpegDataUri = "data:image/jpeg;base64," + btoa(byteout.join(""));
        byteout = [];
        var duration = (/* @__PURE__ */ new Date()).getTime() - time_start;
        return jpegDataUri;
      };
      function setQuality(quality2) {
        if (quality2 <= 0) {
          quality2 = 1;
        }
        if (quality2 > 100) {
          quality2 = 100;
        }
        if (currentQuality == quality2) return;
        var sf = 0;
        if (quality2 < 50) {
          sf = Math.floor(5e3 / quality2);
        } else {
          sf = Math.floor(200 - quality2 * 2);
        }
        initQuantTables(sf);
        currentQuality = quality2;
      }
      function init() {
        var time_start = (/* @__PURE__ */ new Date()).getTime();
        if (!quality) quality = 50;
        initCharLookupTable();
        initHuffmanTbl();
        initCategoryNumber();
        initRGBYUVTable();
        setQuality(quality);
        var duration = (/* @__PURE__ */ new Date()).getTime() - time_start;
      }
      init();
    }
    if (typeof module !== "undefined") {
      module.exports = encode;
    } else if (typeof window !== "undefined") {
      window["jpeg-js"] = window["jpeg-js"] || {};
      window["jpeg-js"].encode = encode;
    }
    function encode(imgData, qu) {
      if (typeof qu === "undefined") qu = 50;
      var encoder = new JPEGEncoder(qu);
      var data = encoder.encode(imgData, qu);
      return {
        data,
        width: imgData.width,
        height: imgData.height
      };
    }
  }
});

// node_modules/jpeg-js/lib/decoder.js
var require_decoder = __commonJS({
  "node_modules/jpeg-js/lib/decoder.js"(exports, module) {
    var JpegImage = (function jpegImage() {
      "use strict";
      var dctZigZag = new Int32Array([
        0,
        1,
        8,
        16,
        9,
        2,
        3,
        10,
        17,
        24,
        32,
        25,
        18,
        11,
        4,
        5,
        12,
        19,
        26,
        33,
        40,
        48,
        41,
        34,
        27,
        20,
        13,
        6,
        7,
        14,
        21,
        28,
        35,
        42,
        49,
        56,
        57,
        50,
        43,
        36,
        29,
        22,
        15,
        23,
        30,
        37,
        44,
        51,
        58,
        59,
        52,
        45,
        38,
        31,
        39,
        46,
        53,
        60,
        61,
        54,
        47,
        55,
        62,
        63
      ]);
      var dctCos1 = 4017;
      var dctSin1 = 799;
      var dctCos3 = 3406;
      var dctSin3 = 2276;
      var dctCos6 = 1567;
      var dctSin6 = 3784;
      var dctSqrt2 = 5793;
      var dctSqrt1d2 = 2896;
      function constructor() {
      }
      function buildHuffmanTable(codeLengths, values) {
        var k = 0, code = [], i, j, length = 16;
        while (length > 0 && !codeLengths[length - 1])
          length--;
        code.push({ children: [], index: 0 });
        var p = code[0], q;
        for (i = 0; i < length; i++) {
          for (j = 0; j < codeLengths[i]; j++) {
            p = code.pop();
            p.children[p.index] = values[k];
            while (p.index > 0) {
              if (code.length === 0)
                throw new Error("Could not recreate Huffman Table");
              p = code.pop();
            }
            p.index++;
            code.push(p);
            while (code.length <= i) {
              code.push(q = { children: [], index: 0 });
              p.children[p.index] = q.children;
              p = q;
            }
            k++;
          }
          if (i + 1 < length) {
            code.push(q = { children: [], index: 0 });
            p.children[p.index] = q.children;
            p = q;
          }
        }
        return code[0].children;
      }
      function decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successivePrev, successive, opts) {
        var precision = frame.precision;
        var samplesPerLine = frame.samplesPerLine;
        var scanLines = frame.scanLines;
        var mcusPerLine = frame.mcusPerLine;
        var progressive = frame.progressive;
        var maxH = frame.maxH, maxV = frame.maxV;
        var startOffset = offset, bitsData = 0, bitsCount = 0;
        function readBit() {
          if (bitsCount > 0) {
            bitsCount--;
            return bitsData >> bitsCount & 1;
          }
          bitsData = data[offset++];
          if (bitsData == 255) {
            var nextByte = data[offset++];
            if (nextByte) {
              throw new Error("unexpected marker: " + (bitsData << 8 | nextByte).toString(16));
            }
          }
          bitsCount = 7;
          return bitsData >>> 7;
        }
        function decodeHuffman(tree) {
          var node = tree, bit;
          while ((bit = readBit()) !== null) {
            node = node[bit];
            if (typeof node === "number")
              return node;
            if (typeof node !== "object")
              throw new Error("invalid huffman sequence");
          }
          return null;
        }
        function receive(length) {
          var n2 = 0;
          while (length > 0) {
            var bit = readBit();
            if (bit === null) return;
            n2 = n2 << 1 | bit;
            length--;
          }
          return n2;
        }
        function receiveAndExtend(length) {
          var n2 = receive(length);
          if (n2 >= 1 << length - 1)
            return n2;
          return n2 + (-1 << length) + 1;
        }
        function decodeBaseline(component2, zz) {
          var t = decodeHuffman(component2.huffmanTableDC);
          var diff = t === 0 ? 0 : receiveAndExtend(t);
          zz[0] = component2.pred += diff;
          var k2 = 1;
          while (k2 < 64) {
            var rs = decodeHuffman(component2.huffmanTableAC);
            var s = rs & 15, r = rs >> 4;
            if (s === 0) {
              if (r < 15)
                break;
              k2 += 16;
              continue;
            }
            k2 += r;
            var z = dctZigZag[k2];
            zz[z] = receiveAndExtend(s);
            k2++;
          }
        }
        function decodeDCFirst(component2, zz) {
          var t = decodeHuffman(component2.huffmanTableDC);
          var diff = t === 0 ? 0 : receiveAndExtend(t) << successive;
          zz[0] = component2.pred += diff;
        }
        function decodeDCSuccessive(component2, zz) {
          zz[0] |= readBit() << successive;
        }
        var eobrun = 0;
        function decodeACFirst(component2, zz) {
          if (eobrun > 0) {
            eobrun--;
            return;
          }
          var k2 = spectralStart, e = spectralEnd;
          while (k2 <= e) {
            var rs = decodeHuffman(component2.huffmanTableAC);
            var s = rs & 15, r = rs >> 4;
            if (s === 0) {
              if (r < 15) {
                eobrun = receive(r) + (1 << r) - 1;
                break;
              }
              k2 += 16;
              continue;
            }
            k2 += r;
            var z = dctZigZag[k2];
            zz[z] = receiveAndExtend(s) * (1 << successive);
            k2++;
          }
        }
        var successiveACState = 0, successiveACNextValue;
        function decodeACSuccessive(component2, zz) {
          var k2 = spectralStart, e = spectralEnd, r = 0;
          while (k2 <= e) {
            var z = dctZigZag[k2];
            var direction = zz[z] < 0 ? -1 : 1;
            switch (successiveACState) {
              case 0:
                var rs = decodeHuffman(component2.huffmanTableAC);
                var s = rs & 15, r = rs >> 4;
                if (s === 0) {
                  if (r < 15) {
                    eobrun = receive(r) + (1 << r);
                    successiveACState = 4;
                  } else {
                    r = 16;
                    successiveACState = 1;
                  }
                } else {
                  if (s !== 1)
                    throw new Error("invalid ACn encoding");
                  successiveACNextValue = receiveAndExtend(s);
                  successiveACState = r ? 2 : 3;
                }
                continue;
              case 1:
              // skipping r zero items
              case 2:
                if (zz[z])
                  zz[z] += (readBit() << successive) * direction;
                else {
                  r--;
                  if (r === 0)
                    successiveACState = successiveACState == 2 ? 3 : 0;
                }
                break;
              case 3:
                if (zz[z])
                  zz[z] += (readBit() << successive) * direction;
                else {
                  zz[z] = successiveACNextValue << successive;
                  successiveACState = 0;
                }
                break;
              case 4:
                if (zz[z])
                  zz[z] += (readBit() << successive) * direction;
                break;
            }
            k2++;
          }
          if (successiveACState === 4) {
            eobrun--;
            if (eobrun === 0)
              successiveACState = 0;
          }
        }
        function decodeMcu(component2, decode2, mcu2, row, col) {
          var mcuRow = mcu2 / mcusPerLine | 0;
          var mcuCol = mcu2 % mcusPerLine;
          var blockRow = mcuRow * component2.v + row;
          var blockCol = mcuCol * component2.h + col;
          if (component2.blocks[blockRow] === void 0 && opts.tolerantDecoding)
            return;
          decode2(component2, component2.blocks[blockRow][blockCol]);
        }
        function decodeBlock(component2, decode2, mcu2) {
          var blockRow = mcu2 / component2.blocksPerLine | 0;
          var blockCol = mcu2 % component2.blocksPerLine;
          if (component2.blocks[blockRow] === void 0 && opts.tolerantDecoding)
            return;
          decode2(component2, component2.blocks[blockRow][blockCol]);
        }
        var componentsLength = components.length;
        var component, i, j, k, n;
        var decodeFn;
        if (progressive) {
          if (spectralStart === 0)
            decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
          else
            decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
        } else {
          decodeFn = decodeBaseline;
        }
        var mcu = 0, marker;
        var mcuExpected;
        if (componentsLength == 1) {
          mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
        } else {
          mcuExpected = mcusPerLine * frame.mcusPerColumn;
        }
        if (!resetInterval) resetInterval = mcuExpected;
        var h, v;
        while (mcu < mcuExpected) {
          for (i = 0; i < componentsLength; i++)
            components[i].pred = 0;
          eobrun = 0;
          if (componentsLength == 1) {
            component = components[0];
            for (n = 0; n < resetInterval; n++) {
              decodeBlock(component, decodeFn, mcu);
              mcu++;
            }
          } else {
            for (n = 0; n < resetInterval; n++) {
              for (i = 0; i < componentsLength; i++) {
                component = components[i];
                h = component.h;
                v = component.v;
                for (j = 0; j < v; j++) {
                  for (k = 0; k < h; k++) {
                    decodeMcu(component, decodeFn, mcu, j, k);
                  }
                }
              }
              mcu++;
              if (mcu === mcuExpected) break;
            }
          }
          if (mcu === mcuExpected) {
            do {
              if (data[offset] === 255) {
                if (data[offset + 1] !== 0) {
                  break;
                }
              }
              offset += 1;
            } while (offset < data.length - 2);
          }
          bitsCount = 0;
          marker = data[offset] << 8 | data[offset + 1];
          if (marker < 65280) {
            throw new Error("marker was not found");
          }
          if (marker >= 65488 && marker <= 65495) {
            offset += 2;
          } else
            break;
        }
        return offset - startOffset;
      }
      function buildComponentData(frame, component) {
        var lines = [];
        var blocksPerLine = component.blocksPerLine;
        var blocksPerColumn = component.blocksPerColumn;
        var samplesPerLine = blocksPerLine << 3;
        var R = new Int32Array(64), r = new Uint8Array(64);
        function quantizeAndInverse(zz, dataOut, dataIn) {
          var qt = component.quantizationTable;
          var v0, v1, v2, v3, v4, v5, v6, v7, t;
          var p = dataIn;
          var i2;
          for (i2 = 0; i2 < 64; i2++)
            p[i2] = zz[i2] * qt[i2];
          for (i2 = 0; i2 < 8; ++i2) {
            var row = 8 * i2;
            if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 && p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 && p[7 + row] == 0) {
              t = dctSqrt2 * p[0 + row] + 512 >> 10;
              p[0 + row] = t;
              p[1 + row] = t;
              p[2 + row] = t;
              p[3 + row] = t;
              p[4 + row] = t;
              p[5 + row] = t;
              p[6 + row] = t;
              p[7 + row] = t;
              continue;
            }
            v0 = dctSqrt2 * p[0 + row] + 128 >> 8;
            v1 = dctSqrt2 * p[4 + row] + 128 >> 8;
            v2 = p[2 + row];
            v3 = p[6 + row];
            v4 = dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128 >> 8;
            v7 = dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128 >> 8;
            v5 = p[3 + row] << 4;
            v6 = p[5 + row] << 4;
            t = v0 - v1 + 1 >> 1;
            v0 = v0 + v1 + 1 >> 1;
            v1 = t;
            t = v2 * dctSin6 + v3 * dctCos6 + 128 >> 8;
            v2 = v2 * dctCos6 - v3 * dctSin6 + 128 >> 8;
            v3 = t;
            t = v4 - v6 + 1 >> 1;
            v4 = v4 + v6 + 1 >> 1;
            v6 = t;
            t = v7 + v5 + 1 >> 1;
            v5 = v7 - v5 + 1 >> 1;
            v7 = t;
            t = v0 - v3 + 1 >> 1;
            v0 = v0 + v3 + 1 >> 1;
            v3 = t;
            t = v1 - v2 + 1 >> 1;
            v1 = v1 + v2 + 1 >> 1;
            v2 = t;
            t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
            v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
            v7 = t;
            t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
            v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
            v6 = t;
            p[0 + row] = v0 + v7;
            p[7 + row] = v0 - v7;
            p[1 + row] = v1 + v6;
            p[6 + row] = v1 - v6;
            p[2 + row] = v2 + v5;
            p[5 + row] = v2 - v5;
            p[3 + row] = v3 + v4;
            p[4 + row] = v3 - v4;
          }
          for (i2 = 0; i2 < 8; ++i2) {
            var col = i2;
            if (p[1 * 8 + col] == 0 && p[2 * 8 + col] == 0 && p[3 * 8 + col] == 0 && p[4 * 8 + col] == 0 && p[5 * 8 + col] == 0 && p[6 * 8 + col] == 0 && p[7 * 8 + col] == 0) {
              t = dctSqrt2 * dataIn[i2 + 0] + 8192 >> 14;
              p[0 * 8 + col] = t;
              p[1 * 8 + col] = t;
              p[2 * 8 + col] = t;
              p[3 * 8 + col] = t;
              p[4 * 8 + col] = t;
              p[5 * 8 + col] = t;
              p[6 * 8 + col] = t;
              p[7 * 8 + col] = t;
              continue;
            }
            v0 = dctSqrt2 * p[0 * 8 + col] + 2048 >> 12;
            v1 = dctSqrt2 * p[4 * 8 + col] + 2048 >> 12;
            v2 = p[2 * 8 + col];
            v3 = p[6 * 8 + col];
            v4 = dctSqrt1d2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048 >> 12;
            v7 = dctSqrt1d2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048 >> 12;
            v5 = p[3 * 8 + col];
            v6 = p[5 * 8 + col];
            t = v0 - v1 + 1 >> 1;
            v0 = v0 + v1 + 1 >> 1;
            v1 = t;
            t = v2 * dctSin6 + v3 * dctCos6 + 2048 >> 12;
            v2 = v2 * dctCos6 - v3 * dctSin6 + 2048 >> 12;
            v3 = t;
            t = v4 - v6 + 1 >> 1;
            v4 = v4 + v6 + 1 >> 1;
            v6 = t;
            t = v7 + v5 + 1 >> 1;
            v5 = v7 - v5 + 1 >> 1;
            v7 = t;
            t = v0 - v3 + 1 >> 1;
            v0 = v0 + v3 + 1 >> 1;
            v3 = t;
            t = v1 - v2 + 1 >> 1;
            v1 = v1 + v2 + 1 >> 1;
            v2 = t;
            t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
            v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
            v7 = t;
            t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
            v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
            v6 = t;
            p[0 * 8 + col] = v0 + v7;
            p[7 * 8 + col] = v0 - v7;
            p[1 * 8 + col] = v1 + v6;
            p[6 * 8 + col] = v1 - v6;
            p[2 * 8 + col] = v2 + v5;
            p[5 * 8 + col] = v2 - v5;
            p[3 * 8 + col] = v3 + v4;
            p[4 * 8 + col] = v3 - v4;
          }
          for (i2 = 0; i2 < 64; ++i2) {
            var sample2 = 128 + (p[i2] + 8 >> 4);
            dataOut[i2] = sample2 < 0 ? 0 : sample2 > 255 ? 255 : sample2;
          }
        }
        requestMemoryAllocation(samplesPerLine * blocksPerColumn * 8);
        var i, j;
        for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
          var scanLine = blockRow << 3;
          for (i = 0; i < 8; i++)
            lines.push(new Uint8Array(samplesPerLine));
          for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
            quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);
            var offset = 0, sample = blockCol << 3;
            for (j = 0; j < 8; j++) {
              var line = lines[scanLine + j];
              for (i = 0; i < 8; i++)
                line[sample + i] = r[offset++];
            }
          }
        }
        return lines;
      }
      function clampTo8bit(a) {
        return a < 0 ? 0 : a > 255 ? 255 : a;
      }
      constructor.prototype = {
        load: function load(path2) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", path2, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = (function() {
            var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
            this.parse(data);
            if (this.onload)
              this.onload();
          }).bind(this);
          xhr.send(null);
        },
        parse: function parse(data) {
          var maxResolutionInPixels = this.opts.maxResolutionInMP * 1e3 * 1e3;
          var offset = 0, length = data.length;
          function readUint16() {
            var value = data[offset] << 8 | data[offset + 1];
            offset += 2;
            return value;
          }
          function readDataBlock() {
            var length2 = readUint16();
            var array = data.subarray(offset, offset + length2 - 2);
            offset += array.length;
            return array;
          }
          function prepareComponents(frame2) {
            var maxH2 = 1, maxV2 = 1;
            var component2, componentId2;
            for (componentId2 in frame2.components) {
              if (frame2.components.hasOwnProperty(componentId2)) {
                component2 = frame2.components[componentId2];
                if (maxH2 < component2.h) maxH2 = component2.h;
                if (maxV2 < component2.v) maxV2 = component2.v;
              }
            }
            var mcusPerLine = Math.ceil(frame2.samplesPerLine / 8 / maxH2);
            var mcusPerColumn = Math.ceil(frame2.scanLines / 8 / maxV2);
            for (componentId2 in frame2.components) {
              if (frame2.components.hasOwnProperty(componentId2)) {
                component2 = frame2.components[componentId2];
                var blocksPerLine = Math.ceil(Math.ceil(frame2.samplesPerLine / 8) * component2.h / maxH2);
                var blocksPerColumn = Math.ceil(Math.ceil(frame2.scanLines / 8) * component2.v / maxV2);
                var blocksPerLineForMcu = mcusPerLine * component2.h;
                var blocksPerColumnForMcu = mcusPerColumn * component2.v;
                var blocksToAllocate = blocksPerColumnForMcu * blocksPerLineForMcu;
                var blocks = [];
                requestMemoryAllocation(blocksToAllocate * 256);
                for (var i2 = 0; i2 < blocksPerColumnForMcu; i2++) {
                  var row = [];
                  for (var j2 = 0; j2 < blocksPerLineForMcu; j2++)
                    row.push(new Int32Array(64));
                  blocks.push(row);
                }
                component2.blocksPerLine = blocksPerLine;
                component2.blocksPerColumn = blocksPerColumn;
                component2.blocks = blocks;
              }
            }
            frame2.maxH = maxH2;
            frame2.maxV = maxV2;
            frame2.mcusPerLine = mcusPerLine;
            frame2.mcusPerColumn = mcusPerColumn;
          }
          var jfif = null;
          var adobe = null;
          var pixels = null;
          var frame, resetInterval;
          var quantizationTables = [], frames = [];
          var huffmanTablesAC = [], huffmanTablesDC = [];
          var fileMarker = readUint16();
          var malformedDataOffset = -1;
          this.comments = [];
          if (fileMarker != 65496) {
            throw new Error("SOI not found");
          }
          fileMarker = readUint16();
          while (fileMarker != 65497) {
            var i, j, l;
            switch (fileMarker) {
              case 65280:
                break;
              case 65504:
              // APP0 (Application Specific)
              case 65505:
              // APP1
              case 65506:
              // APP2
              case 65507:
              // APP3
              case 65508:
              // APP4
              case 65509:
              // APP5
              case 65510:
              // APP6
              case 65511:
              // APP7
              case 65512:
              // APP8
              case 65513:
              // APP9
              case 65514:
              // APP10
              case 65515:
              // APP11
              case 65516:
              // APP12
              case 65517:
              // APP13
              case 65518:
              // APP14
              case 65519:
              // APP15
              case 65534:
                var appData = readDataBlock();
                if (fileMarker === 65534) {
                  var comment = String.fromCharCode.apply(null, appData);
                  this.comments.push(comment);
                }
                if (fileMarker === 65504) {
                  if (appData[0] === 74 && appData[1] === 70 && appData[2] === 73 && appData[3] === 70 && appData[4] === 0) {
                    jfif = {
                      version: { major: appData[5], minor: appData[6] },
                      densityUnits: appData[7],
                      xDensity: appData[8] << 8 | appData[9],
                      yDensity: appData[10] << 8 | appData[11],
                      thumbWidth: appData[12],
                      thumbHeight: appData[13],
                      thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                    };
                  }
                }
                if (fileMarker === 65505) {
                  if (appData[0] === 69 && appData[1] === 120 && appData[2] === 105 && appData[3] === 102 && appData[4] === 0) {
                    this.exifBuffer = appData.subarray(5, appData.length);
                  }
                }
                if (fileMarker === 65518) {
                  if (appData[0] === 65 && appData[1] === 100 && appData[2] === 111 && appData[3] === 98 && appData[4] === 101 && appData[5] === 0) {
                    adobe = {
                      version: appData[6],
                      flags0: appData[7] << 8 | appData[8],
                      flags1: appData[9] << 8 | appData[10],
                      transformCode: appData[11]
                    };
                  }
                }
                break;
              case 65499:
                var quantizationTablesLength = readUint16();
                var quantizationTablesEnd = quantizationTablesLength + offset - 2;
                while (offset < quantizationTablesEnd) {
                  var quantizationTableSpec = data[offset++];
                  requestMemoryAllocation(64 * 4);
                  var tableData = new Int32Array(64);
                  if (quantizationTableSpec >> 4 === 0) {
                    for (j = 0; j < 64; j++) {
                      var z = dctZigZag[j];
                      tableData[z] = data[offset++];
                    }
                  } else if (quantizationTableSpec >> 4 === 1) {
                    for (j = 0; j < 64; j++) {
                      var z = dctZigZag[j];
                      tableData[z] = readUint16();
                    }
                  } else
                    throw new Error("DQT: invalid table spec");
                  quantizationTables[quantizationTableSpec & 15] = tableData;
                }
                break;
              case 65472:
              // SOF0 (Start of Frame, Baseline DCT)
              case 65473:
              // SOF1 (Start of Frame, Extended DCT)
              case 65474:
                readUint16();
                frame = {};
                frame.extended = fileMarker === 65473;
                frame.progressive = fileMarker === 65474;
                frame.precision = data[offset++];
                frame.scanLines = readUint16();
                frame.samplesPerLine = readUint16();
                frame.components = {};
                frame.componentsOrder = [];
                var pixelsInFrame = frame.scanLines * frame.samplesPerLine;
                if (pixelsInFrame > maxResolutionInPixels) {
                  var exceededAmount = Math.ceil((pixelsInFrame - maxResolutionInPixels) / 1e6);
                  throw new Error(`maxResolutionInMP limit exceeded by ${exceededAmount}MP`);
                }
                var componentsCount = data[offset++], componentId;
                var maxH = 0, maxV = 0;
                for (i = 0; i < componentsCount; i++) {
                  componentId = data[offset];
                  var h = data[offset + 1] >> 4;
                  var v = data[offset + 1] & 15;
                  var qId = data[offset + 2];
                  if (h <= 0 || v <= 0) {
                    throw new Error("Invalid sampling factor, expected values above 0");
                  }
                  frame.componentsOrder.push(componentId);
                  frame.components[componentId] = {
                    h,
                    v,
                    quantizationIdx: qId
                  };
                  offset += 3;
                }
                prepareComponents(frame);
                frames.push(frame);
                break;
              case 65476:
                var huffmanLength = readUint16();
                for (i = 2; i < huffmanLength; ) {
                  var huffmanTableSpec = data[offset++];
                  var codeLengths = new Uint8Array(16);
                  var codeLengthSum = 0;
                  for (j = 0; j < 16; j++, offset++) {
                    codeLengthSum += codeLengths[j] = data[offset];
                  }
                  requestMemoryAllocation(16 + codeLengthSum);
                  var huffmanValues = new Uint8Array(codeLengthSum);
                  for (j = 0; j < codeLengthSum; j++, offset++)
                    huffmanValues[j] = data[offset];
                  i += 17 + codeLengthSum;
                  (huffmanTableSpec >> 4 === 0 ? huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] = buildHuffmanTable(codeLengths, huffmanValues);
                }
                break;
              case 65501:
                readUint16();
                resetInterval = readUint16();
                break;
              case 65500:
                readUint16();
                readUint16();
                break;
              case 65498:
                var scanLength = readUint16();
                var selectorsCount = data[offset++];
                var components = [], component;
                for (i = 0; i < selectorsCount; i++) {
                  component = frame.components[data[offset++]];
                  var tableSpec = data[offset++];
                  component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
                  component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
                  components.push(component);
                }
                var spectralStart = data[offset++];
                var spectralEnd = data[offset++];
                var successiveApproximation = data[offset++];
                var processed = decodeScan(
                  data,
                  offset,
                  frame,
                  components,
                  resetInterval,
                  spectralStart,
                  spectralEnd,
                  successiveApproximation >> 4,
                  successiveApproximation & 15,
                  this.opts
                );
                offset += processed;
                break;
              case 65535:
                if (data[offset] !== 255) {
                  offset--;
                }
                break;
              default:
                if (data[offset - 3] == 255 && data[offset - 2] >= 192 && data[offset - 2] <= 254) {
                  offset -= 3;
                  break;
                } else if (fileMarker === 224 || fileMarker == 225) {
                  if (malformedDataOffset !== -1) {
                    throw new Error(`first unknown JPEG marker at offset ${malformedDataOffset.toString(16)}, second unknown JPEG marker ${fileMarker.toString(16)} at offset ${(offset - 1).toString(16)}`);
                  }
                  malformedDataOffset = offset - 1;
                  const nextOffset = readUint16();
                  if (data[offset + nextOffset - 2] === 255) {
                    offset += nextOffset - 2;
                    break;
                  }
                }
                throw new Error("unknown JPEG marker " + fileMarker.toString(16));
            }
            fileMarker = readUint16();
          }
          if (frames.length != 1)
            throw new Error("only single frame JPEGs supported");
          for (var i = 0; i < frames.length; i++) {
            var cp = frames[i].components;
            for (var j in cp) {
              cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
              delete cp[j].quantizationIdx;
            }
          }
          this.width = frame.samplesPerLine;
          this.height = frame.scanLines;
          this.jfif = jfif;
          this.adobe = adobe;
          this.components = [];
          for (var i = 0; i < frame.componentsOrder.length; i++) {
            var component = frame.components[frame.componentsOrder[i]];
            this.components.push({
              lines: buildComponentData(frame, component),
              scaleX: component.h / frame.maxH,
              scaleY: component.v / frame.maxV
            });
          }
        },
        getData: function getData(width, height) {
          var scaleX = this.width / width, scaleY = this.height / height;
          var component1, component2, component3, component4;
          var component1Line, component2Line, component3Line, component4Line;
          var x, y;
          var offset = 0;
          var Y, Cb, Cr, K, C, M, Ye, R, G, B;
          var colorTransform;
          var dataLength = width * height * this.components.length;
          requestMemoryAllocation(dataLength);
          var data = new Uint8Array(dataLength);
          switch (this.components.length) {
            case 1:
              component1 = this.components[0];
              for (y = 0; y < height; y++) {
                component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                for (x = 0; x < width; x++) {
                  Y = component1Line[0 | x * component1.scaleX * scaleX];
                  data[offset++] = Y;
                }
              }
              break;
            case 2:
              component1 = this.components[0];
              component2 = this.components[1];
              for (y = 0; y < height; y++) {
                component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                for (x = 0; x < width; x++) {
                  Y = component1Line[0 | x * component1.scaleX * scaleX];
                  data[offset++] = Y;
                  Y = component2Line[0 | x * component2.scaleX * scaleX];
                  data[offset++] = Y;
                }
              }
              break;
            case 3:
              colorTransform = true;
              if (this.adobe && this.adobe.transformCode)
                colorTransform = true;
              else if (typeof this.opts.colorTransform !== "undefined")
                colorTransform = !!this.opts.colorTransform;
              component1 = this.components[0];
              component2 = this.components[1];
              component3 = this.components[2];
              for (y = 0; y < height; y++) {
                component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                component3Line = component3.lines[0 | y * component3.scaleY * scaleY];
                for (x = 0; x < width; x++) {
                  if (!colorTransform) {
                    R = component1Line[0 | x * component1.scaleX * scaleX];
                    G = component2Line[0 | x * component2.scaleX * scaleX];
                    B = component3Line[0 | x * component3.scaleX * scaleX];
                  } else {
                    Y = component1Line[0 | x * component1.scaleX * scaleX];
                    Cb = component2Line[0 | x * component2.scaleX * scaleX];
                    Cr = component3Line[0 | x * component3.scaleX * scaleX];
                    R = clampTo8bit(Y + 1.402 * (Cr - 128));
                    G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                    B = clampTo8bit(Y + 1.772 * (Cb - 128));
                  }
                  data[offset++] = R;
                  data[offset++] = G;
                  data[offset++] = B;
                }
              }
              break;
            case 4:
              if (!this.adobe)
                throw new Error("Unsupported color mode (4 components)");
              colorTransform = false;
              if (this.adobe && this.adobe.transformCode)
                colorTransform = true;
              else if (typeof this.opts.colorTransform !== "undefined")
                colorTransform = !!this.opts.colorTransform;
              component1 = this.components[0];
              component2 = this.components[1];
              component3 = this.components[2];
              component4 = this.components[3];
              for (y = 0; y < height; y++) {
                component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                component3Line = component3.lines[0 | y * component3.scaleY * scaleY];
                component4Line = component4.lines[0 | y * component4.scaleY * scaleY];
                for (x = 0; x < width; x++) {
                  if (!colorTransform) {
                    C = component1Line[0 | x * component1.scaleX * scaleX];
                    M = component2Line[0 | x * component2.scaleX * scaleX];
                    Ye = component3Line[0 | x * component3.scaleX * scaleX];
                    K = component4Line[0 | x * component4.scaleX * scaleX];
                  } else {
                    Y = component1Line[0 | x * component1.scaleX * scaleX];
                    Cb = component2Line[0 | x * component2.scaleX * scaleX];
                    Cr = component3Line[0 | x * component3.scaleX * scaleX];
                    K = component4Line[0 | x * component4.scaleX * scaleX];
                    C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                    M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                    Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
                  }
                  data[offset++] = 255 - C;
                  data[offset++] = 255 - M;
                  data[offset++] = 255 - Ye;
                  data[offset++] = 255 - K;
                }
              }
              break;
            default:
              throw new Error("Unsupported color mode");
          }
          return data;
        },
        copyToImageData: function copyToImageData(imageData, formatAsRGBA) {
          var width = imageData.width, height = imageData.height;
          var imageDataArray = imageData.data;
          var data = this.getData(width, height);
          var i = 0, j = 0, x, y;
          var Y, K, C, M, R, G, B;
          switch (this.components.length) {
            case 1:
              for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                  Y = data[i++];
                  imageDataArray[j++] = Y;
                  imageDataArray[j++] = Y;
                  imageDataArray[j++] = Y;
                  if (formatAsRGBA) {
                    imageDataArray[j++] = 255;
                  }
                }
              }
              break;
            case 3:
              for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                  R = data[i++];
                  G = data[i++];
                  B = data[i++];
                  imageDataArray[j++] = R;
                  imageDataArray[j++] = G;
                  imageDataArray[j++] = B;
                  if (formatAsRGBA) {
                    imageDataArray[j++] = 255;
                  }
                }
              }
              break;
            case 4:
              for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                  C = data[i++];
                  M = data[i++];
                  Y = data[i++];
                  K = data[i++];
                  R = 255 - clampTo8bit(C * (1 - K / 255) + K);
                  G = 255 - clampTo8bit(M * (1 - K / 255) + K);
                  B = 255 - clampTo8bit(Y * (1 - K / 255) + K);
                  imageDataArray[j++] = R;
                  imageDataArray[j++] = G;
                  imageDataArray[j++] = B;
                  if (formatAsRGBA) {
                    imageDataArray[j++] = 255;
                  }
                }
              }
              break;
            default:
              throw new Error("Unsupported color mode");
          }
        }
      };
      var totalBytesAllocated = 0;
      var maxMemoryUsageBytes = 0;
      function requestMemoryAllocation(increaseAmount = 0) {
        var totalMemoryImpactBytes = totalBytesAllocated + increaseAmount;
        if (totalMemoryImpactBytes > maxMemoryUsageBytes) {
          var exceededAmount = Math.ceil((totalMemoryImpactBytes - maxMemoryUsageBytes) / 1024 / 1024);
          throw new Error(`maxMemoryUsageInMB limit exceeded by at least ${exceededAmount}MB`);
        }
        totalBytesAllocated = totalMemoryImpactBytes;
      }
      constructor.resetMaxMemoryUsage = function(maxMemoryUsageBytes_) {
        totalBytesAllocated = 0;
        maxMemoryUsageBytes = maxMemoryUsageBytes_;
      };
      constructor.getBytesAllocated = function() {
        return totalBytesAllocated;
      };
      constructor.requestMemoryAllocation = requestMemoryAllocation;
      return constructor;
    })();
    if (typeof module !== "undefined") {
      module.exports = decode;
    } else if (typeof window !== "undefined") {
      window["jpeg-js"] = window["jpeg-js"] || {};
      window["jpeg-js"].decode = decode;
    }
    function decode(jpegData, userOpts = {}) {
      var defaultOpts = {
        // "undefined" means "Choose whether to transform colors based on the image’s color model."
        colorTransform: void 0,
        useTArray: false,
        formatAsRGBA: true,
        tolerantDecoding: true,
        maxResolutionInMP: 100,
        // Don't decode more than 100 megapixels
        maxMemoryUsageInMB: 512
        // Don't decode if memory footprint is more than 512MB
      };
      var opts = { ...defaultOpts, ...userOpts };
      var arr = new Uint8Array(jpegData);
      var decoder = new JpegImage();
      decoder.opts = opts;
      JpegImage.resetMaxMemoryUsage(opts.maxMemoryUsageInMB * 1024 * 1024);
      decoder.parse(arr);
      var channels = opts.formatAsRGBA ? 4 : 3;
      var bytesNeeded = decoder.width * decoder.height * channels;
      try {
        JpegImage.requestMemoryAllocation(bytesNeeded);
        var image = {
          width: decoder.width,
          height: decoder.height,
          exifBuffer: decoder.exifBuffer,
          data: opts.useTArray ? new Uint8Array(bytesNeeded) : Buffer.alloc(bytesNeeded)
        };
        if (decoder.comments.length > 0) {
          image["comments"] = decoder.comments;
        }
      } catch (err) {
        if (err instanceof RangeError) {
          throw new Error("Could not allocate enough memory for the image. Required: " + bytesNeeded);
        }
        if (err instanceof ReferenceError) {
          if (err.message === "Buffer is not defined") {
            throw new Error("Buffer is not globally defined in this environment. Consider setting useTArray to true");
          }
        }
        throw err;
      }
      decoder.copyToImageData(image, opts.formatAsRGBA);
      return image;
    }
  }
});

// node_modules/jpeg-js/index.js
var require_jpeg_js = __commonJS({
  "node_modules/jpeg-js/index.js"(exports, module) {
    var encode = require_encoder();
    var decode = require_decoder();
    module.exports = {
      encode,
      decode
    };
  }
});

// scripts/scene-helper-entry.js
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// third_party/dsh-skins/pkg-extract.ts
import { Buffer as Buffer2 } from "node:buffer";
var import_jpeg_js = __toESM(require_jpeg_js(), 1);
import { deflateSync, inflateSync } from "node:zlib";
var MAX_PKG_ENTRY_BYTES = 512 * 1024 * 1024;
var MAX_DECOMPRESSED_BYTES = 256 * 1024 * 1024;
var MAX_TEX_DIMENSION = 16384;
var MAX_TEX_PIXELS = 64 * 1024 * 1024;
var PKG_ENTRY_FLAG_LZ4 = 1;
var TexFormat = {
  RGBA8888: 0,
  RGB888: 1,
  RGB565: 2,
  DXT5: 4,
  DXT3: 6,
  DXT1: 7,
  RG88: 8,
  R8: 9,
  RG1616F: 10,
  R16F: 11,
  BC7: 12,
  RGBA1010102: 13,
  RGBA16161616F: 14,
  RGB161616F: 15
};
var TEX_FORMAT_NAMES = {
  0: "RGBA8888",
  1: "RGB888",
  2: "RGB565",
  4: "DXT5",
  6: "DXT3",
  7: "DXT1",
  8: "RG88",
  9: "R8",
  10: "RG1616F",
  11: "R16F",
  12: "BC7",
  13: "RGBA1010102",
  14: "RGBA16161616F",
  15: "RGB161616F"
};
var TexUnsupportedError = class extends Error {
  /** Raw TEXI0001 format id. */
  format;
  /** Human-readable name of the format id, or 'unknown(N)'. */
  formatName;
  /** Declared TEXI0001 texture dimensions. */
  width;
  height;
  constructor(format, formatName, width, height) {
    super("tex: unsupported format " + format);
    this.name = "TexUnsupportedError";
    this.format = format;
    this.formatName = formatName;
    this.width = width;
    this.height = height;
  }
};
var TEX_FLAG_IS_GIF = 4;
function decodePngToRgba(pngBuf) {
  let pos = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks = [];
  const view = new DataView(pngBuf.buffer, pngBuf.byteOffset, pngBuf.byteLength);
  while (pos < pngBuf.length) {
    const len = view.getUint32(pos, false);
    const type = String.fromCharCode(pngBuf[pos + 4], pngBuf[pos + 5], pngBuf[pos + 6], pngBuf[pos + 7]);
    const data = pngBuf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      const ihdrView = new DataView(data.buffer, data.byteOffset, data.byteLength);
      width = ihdrView.getUint32(0, false);
      height = ihdrView.getUint32(4, false);
      colorType = data[9];
      if (width <= 0 || height <= 0 || width > MAX_TEX_DIMENSION || height > MAX_TEX_DIMENSION || width * height > MAX_TEX_PIXELS) {
        throw new Error("png: invalid dimensions " + width + "x" + height);
      }
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  const totalIdat = idatChunks.reduce((acc, c) => acc + c.length, 0);
  if (totalIdat > MAX_DECOMPRESSED_BYTES) {
    throw new Error("png: idat stream too large (" + totalIdat + " bytes)");
  }
  const combined = new Uint8Array(totalIdat);
  let cur = 0;
  for (const c of idatChunks) {
    combined.set(c, cur);
    cur += c.length;
  }
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * bytesPerPixel;
  const maxOutput = height * (1 + stride) + 64;
  const uncompressed = inflateSync(combined, { maxOutputLength: maxOutput });
  const raw = new Uint8Array(width * height * 4);
  let srcPos = 0;
  const rowBuf = new Uint8Array(stride);
  const prevRowBuf = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filterType = uncompressed[srcPos++];
    for (let x = 0; x < stride; x++) {
      const b = uncompressed[srcPos++];
      const a = x >= bytesPerPixel ? rowBuf[x - bytesPerPixel] : 0;
      const c = x >= bytesPerPixel ? prevRowBuf[x - bytesPerPixel] : 0;
      const p_b = prevRowBuf[x];
      let val = b;
      if (filterType === 1) val = b + a & 255;
      else if (filterType === 2) val = b + p_b & 255;
      else if (filterType === 3) val = b + Math.floor((a + p_b) / 2) & 255;
      else if (filterType === 4) {
        const p = a + p_b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - p_b);
        const pc = Math.abs(p - c);
        let pr = a;
        if (pb < pa && pb < pc) pr = p_b;
        else if (pc < pa) pr = c;
        val = b + pr & 255;
      }
      rowBuf[x] = val;
    }
    prevRowBuf.set(rowBuf);
    for (let x = 0; x < width; x++) {
      const di = (y * width + x) * 4;
      if (colorType === 6) {
        raw[di] = rowBuf[x * 4];
        raw[di + 1] = rowBuf[x * 4 + 1];
        raw[di + 2] = rowBuf[x * 4 + 2];
        raw[di + 3] = rowBuf[x * 4 + 3];
      } else if (colorType === 2) {
        raw[di] = rowBuf[x * 3];
        raw[di + 1] = rowBuf[x * 3 + 1];
        raw[di + 2] = rowBuf[x * 3 + 2];
        raw[di + 3] = 255;
      } else {
        raw[di] = rowBuf[x];
        raw[di + 1] = rowBuf[x];
        raw[di + 2] = rowBuf[x];
        raw[di + 3] = 255;
      }
    }
  }
  return { width, height, rgba: raw };
}
var textDecoder = new TextDecoder("utf-8");
var Reader = class {
  data;
  label;
  view;
  pos = 0;
  constructor(data, label) {
    this.data = data;
    this.label = label;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }
  get remaining() {
    return this.view.byteLength - this.pos;
  }
  need(n) {
    if (n < 0 || this.pos + n > this.view.byteLength) {
      throw new Error(this.label + ": unexpected end of data");
    }
  }
  u8() {
    this.need(1);
    return this.view.getUint8(this.pos++);
  }
  i32() {
    this.need(4);
    const v = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return v;
  }
  u32() {
    this.need(4);
    const v = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }
  /** Unsigned 64-bit integer; safe up to 2^53. */
  u64() {
    const lo = this.u32();
    const hi = this.u32();
    return hi * 4294967296 + lo;
  }
  f32() {
    this.need(4);
    const v = this.view.getFloat32(this.pos, true);
    this.pos += 4;
    return v;
  }
  bytes(n) {
    this.need(n);
    const out = this.data.subarray(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }
  /** int32-length-prefixed UTF-8 string (PKG magic and entry paths). */
  sizedString(maxLength) {
    const length = this.i32();
    if (length < 0 || length > maxLength) {
      throw new Error(this.label + ": invalid string length " + length);
    }
    return textDecoder.decode(this.bytes(length));
  }
  /** NUL-terminated string (all TEX magics and the TEXB0004 json blob). */
  nstring(maxLength) {
    const start = this.pos;
    let end = start;
    const limit = Math.min(this.view.byteLength, start + maxLength);
    while (end < limit && this.view.getUint8(end) !== 0) end++;
    if (end >= limit) {
      throw new Error(this.label + ": unterminated string");
    }
    const out = textDecoder.decode(this.data.subarray(start, end));
    this.pos = end + 1;
    return out;
  }
};
function lz4DecompressBlock(src, dstSize) {
  if (dstSize < 0 || dstSize > MAX_DECOMPRESSED_BYTES) {
    throw new Error("lz4: decompressed size out of bounds (" + String(dstSize) + ")");
  }
  const dst = new Uint8Array(dstSize);
  let ip = 0;
  let op = 0;
  while (ip < src.length) {
    const token = src[ip++];
    let literalLength = token >> 4;
    if (literalLength === 15) {
      let s = 0;
      do {
        if (ip >= src.length) throw new Error("lz4: truncated literal length");
        s = src[ip++];
        literalLength += s;
      } while (s === 255);
    }
    if (ip + literalLength > src.length || op + literalLength > dstSize) {
      throw new Error("lz4: literal run out of bounds");
    }
    dst.set(src.subarray(ip, ip + literalLength), op);
    ip += literalLength;
    op += literalLength;
    if (ip >= src.length) break;
    if (ip + 2 > src.length) throw new Error("lz4: truncated match offset");
    const offset = src[ip] | src[ip + 1] << 8;
    ip += 2;
    if (offset === 0 || offset > op) throw new Error("lz4: invalid match offset " + offset);
    let matchLength = token & 15;
    if (matchLength === 15) {
      let s = 0;
      do {
        if (ip >= src.length) throw new Error("lz4: truncated match length");
        s = src[ip++];
        matchLength += s;
      } while (s === 255);
    }
    matchLength += 4;
    if (op + matchLength > dstSize) throw new Error("lz4: match run out of bounds");
    for (let i = 0; i < matchLength; i++) {
      dst[op] = dst[op - offset];
      op++;
    }
  }
  if (op !== dstSize) {
    throw new Error("lz4: decompressed size mismatch (got " + op + ", expected " + dstSize + ")");
  }
  return dst;
}
function probeCompressedEntry(data, abs, length) {
  if (length < 8) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const originalSize = view.getUint32(abs, true) + view.getUint32(abs + 4, true) * 4294967296;
  if (originalSize <= length || originalSize > 2147483647) return null;
  let pos = abs + 8;
  let total = 0;
  while (total < originalSize) {
    if (pos + 8 > abs + length) return null;
    const uncomp = view.getInt32(pos, true);
    const comp = view.getInt32(pos + 4, true);
    if (uncomp <= 0 || comp <= 0 || pos + 8 + comp > abs + length) return null;
    total += uncomp;
    pos += 8 + comp;
  }
  return total === originalSize && pos === abs + length ? originalSize : null;
}
function parsePkg(data) {
  const r = new Reader(data, "pkg");
  const magic = r.sizedString(32);
  if (!/^PKGV\d{4}$/.test(magic)) {
    throw new Error("pkg: bad magic '" + magic + "'");
  }
  const count = r.i32();
  if (count < 0 || count > 1048576) {
    throw new Error("pkg: invalid entry count " + count);
  }
  const index = [];
  for (let i = 0; i < count; i++) {
    index.push({ path: r.sizedString(1024), offset: r.u32(), length: r.u32() });
  }
  const dataStart = r.pos;
  return index.map(({ path: path2, offset, length }) => {
    const abs = dataStart + offset;
    if (abs + length > data.byteLength) {
      throw new Error("pkg: entry '" + path2 + "' out of bounds");
    }
    const originalSize = probeCompressedEntry(data, abs, length);
    return originalSize === null ? { path: path2, offset: abs, compressedSize: length, size: length, flags: 0 } : { path: path2, offset: abs, compressedSize: length, size: originalSize, flags: PKG_ENTRY_FLAG_LZ4 };
  });
}
function readPkgEntry(data, entry) {
  const abs = entry.offset;
  if (abs < 0 || abs + entry.compressedSize > data.byteLength) {
    throw new Error("pkg: entry '" + entry.path + "' out of bounds");
  }
  if ((entry.flags & PKG_ENTRY_FLAG_LZ4) === 0) {
    return data.slice(abs, abs + entry.compressedSize);
  }
  if (entry.size > MAX_PKG_ENTRY_BYTES) {
    throw new Error("pkg: entry '" + entry.path + "' too large (" + entry.size + " bytes)");
  }
  const r = new Reader(data.subarray(abs, abs + entry.compressedSize), "pkg");
  const originalSize = r.u64();
  if (originalSize !== entry.size) {
    throw new Error("pkg: entry '" + entry.path + "' size mismatch");
  }
  const out = new Uint8Array(entry.size);
  let written = 0;
  while (written < entry.size) {
    const uncomp = r.i32();
    const comp = r.i32();
    if (uncomp <= 0 || comp <= 0 || written + uncomp > entry.size) {
      throw new Error("pkg: corrupt compressed entry '" + entry.path + "'");
    }
    out.set(lz4DecompressBlock(r.bytes(comp), uncomp), written);
    written += uncomp;
  }
  if (r.remaining !== 0) {
    throw new Error("pkg: corrupt compressed entry '" + entry.path + "'");
  }
  return out;
}
function readMipmap(r, containerVersion) {
  if (containerVersion === 4) {
    const param1 = r.i32();
    const param2 = r.i32();
    r.nstring(1 << 20);
    const param3 = r.i32();
    if (param1 !== 1 || param2 !== 2 || param3 !== 1) {
      throw new Error("tex: bad TEXB0004 mipmap params");
    }
  }
  const width = r.i32();
  const height = r.i32();
  if (width <= 0 || height <= 0 || width > 16384 || height > 16384) {
    throw new Error("tex: invalid mipmap dimensions " + width + "x" + height);
  }
  if (containerVersion === 1) {
    return { width, height, bytes: r.bytes(r.i32()) };
  }
  const isLz4 = r.i32() === 1;
  const decompressedCount = r.i32();
  const stored = r.bytes(r.i32());
  if (isLz4) {
    return { width, height, bytes: lz4DecompressBlock(stored, decompressedCount) };
  }
  return { width, height, bytes: stored };
}
function parseTexInternal(data) {
  const r = new Reader(data, "tex");
  const magic1 = r.nstring(16);
  if (magic1 !== "TEXV0005") {
    throw new Error("tex: bad magic '" + magic1 + "'");
  }
  const magic2 = r.nstring(16);
  if (magic2 !== "TEXI0001") {
    throw new Error("tex: bad image-info magic '" + magic2 + "'");
  }
  const format = r.i32();
  const flags = r.i32();
  const textureWidth = r.i32();
  const textureHeight = r.i32();
  const imageWidth = r.i32();
  const imageHeight = r.i32();
  r.u32();
  if (TEX_FORMAT_NAMES[format] === void 0) {
    throw new TexUnsupportedError(format, "unknown(" + format + ")", textureWidth, textureHeight);
  }
  const containerMagic = r.nstring(16);
  const containerMatch = /^TEXB000([1-4])$/.exec(containerMagic);
  if (!containerMatch) {
    throw new Error("tex: bad mipmap container magic '" + containerMagic + "'");
  }
  let containerVersion = Number(containerMatch[1]);
  const imageCount = r.i32();
  if (imageCount <= 0 || imageCount > 256) {
    throw new Error("tex: invalid image count " + imageCount);
  }
  let isVideoMp4 = false;
  if (containerVersion === 3) {
    r.i32();
  } else if (containerVersion === 4) {
    const freeImageFormat = r.i32();
    isVideoMp4 = r.i32() === 1;
    if (!(freeImageFormat === -1 && isVideoMp4)) {
      containerVersion = 3;
    }
  }
  let firstImage = null;
  for (let i = 0; i < imageCount; i++) {
    const mipmapCount = r.i32();
    if (mipmapCount <= 0 || mipmapCount > 32) {
      throw new Error("tex: invalid mipmap count " + mipmapCount);
    }
    const mipmaps = [];
    for (let j = 0; j < mipmapCount; j++) {
      mipmaps.push(readMipmap(r, containerVersion));
    }
    if (firstImage === null) firstImage = mipmaps;
  }
  const isAnimatedGif = (flags & TEX_FLAG_IS_GIF) !== 0;
  const frames = [];
  if (isAnimatedGif) {
    const frameMagic = r.nstring(16);
    const frameMatch = /^TEXS000([1-3])$/.exec(frameMagic);
    if (!frameMatch) {
      throw new Error("tex: bad frame container magic '" + frameMagic + "'");
    }
    const frameVersion = Number(frameMatch[1]);
    const frameCount = r.i32();
    if (frameCount < 0 || frameCount > 4096) {
      throw new Error("tex: invalid frame count " + frameCount);
    }
    if (frameVersion === 3) {
      r.i32();
      r.i32();
    }
    for (let i = 0; i < frameCount; i++) {
      const imageId = r.i32();
      const frametime = r.f32();
      if (frameVersion === 1) {
        const x = r.i32();
        const y = r.i32();
        const width = r.i32();
        r.i32();
        r.i32();
        const height = r.i32();
        frames.push({ framenumber: i, imageId, frametime, x, y, width, height });
      } else {
        const x = r.f32();
        const y = r.f32();
        const width = r.f32();
        r.f32();
        r.f32();
        const height = r.f32();
        frames.push({ framenumber: i, imageId, frametime, x, y, width, height });
      }
    }
  }
  const mip0 = firstImage[0];
  if (!isVideoMp4 && mip0 && mip0.bytes && mip0.bytes.length >= 8) {
    const b = mip0.bytes;
    if (b[4] === 102 && b[5] === 116 && b[6] === 121 && b[7] === 112 || b[0] === 0 && b[1] === 0 && b[2] === 0 && b[3] === 24 && b[4] === 102 && b[5] === 116 && b[6] === 121 && b[7] === 112) {
      isVideoMp4 = true;
    }
  }
  return {
    format,
    flags,
    width: imageWidth > 0 ? imageWidth : textureWidth > 0 ? textureWidth : mip0.width,
    height: imageHeight > 0 ? imageHeight : textureHeight > 0 ? textureHeight : mip0.height,
    isAnimatedGif,
    isVideoMp4,
    frames,
    mipmaps: firstImage
  };
}
function parseTex(data) {
  const parsed = parseTexInternal(data);
  const info = {
    width: parsed.width,
    height: parsed.height,
    format: parsed.format,
    formatName: TEX_FORMAT_NAMES[parsed.format] ?? "unknown(" + parsed.format + ")",
    isAnimatedGif: parsed.isAnimatedGif,
    isVideoMp4: parsed.isVideoMp4,
    mipLevels: parsed.mipmaps.length
  };
  if (parsed.isAnimatedGif) info.frames = parsed.frames;
  return info;
}
function rgb565(value) {
  const r = value >> 11 & 31;
  const g = value >> 5 & 63;
  const b = value & 31;
  return [r << 3 | r >> 2, g << 2 | g >> 4, b << 3 | b >> 2];
}
function buildColorPalette(c0, c1, fourColor) {
  const palette = new Uint8Array(16);
  const [r0, g0, b0] = rgb565(c0);
  const [r1, g1, b1] = rgb565(c1);
  palette.set([r0, g0, b0, 255], 0);
  palette.set([r1, g1, b1, 255], 4);
  if (fourColor) {
    palette.set([(2 * r0 + r1) / 3 | 0, (2 * g0 + g1) / 3 | 0, (2 * b0 + b1) / 3 | 0, 255], 8);
    palette.set([(r0 + 2 * r1) / 3 | 0, (g0 + 2 * g1) / 3 | 0, (b0 + 2 * b1) / 3 | 0, 255], 12);
  } else {
    palette.set([(r0 + r1) / 2 | 0, (g0 + g1) / 2 | 0, (b0 + b1) / 2 | 0, 255], 8);
    palette.set([0, 0, 0, 0], 12);
  }
  return palette;
}
function decodeColorBlocks(src, out, width, height, blockStride, colorOffset, dxt1Alpha) {
  const view = new DataView(src.buffer, src.byteOffset, src.byteLength);
  const blocksX = Math.ceil(width / 4);
  const blocksY = Math.ceil(height / 4);
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const base = (by * blocksX + bx) * blockStride;
      const c0 = view.getUint16(base + colorOffset, true);
      const c1 = view.getUint16(base + colorOffset + 2, true);
      const palette = buildColorPalette(c0, c1, dxt1Alpha ? c0 > c1 : true);
      const indices = view.getUint32(base + colorOffset + 4, true);
      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          const y = by * 4 + py;
          if (x >= width || y >= height) continue;
          const selector = indices >> 2 * (py * 4 + px) & 3;
          const dst = (y * width + x) * 4;
          out[dst] = palette[selector * 4];
          out[dst + 1] = palette[selector * 4 + 1];
          out[dst + 2] = palette[selector * 4 + 2];
          out[dst + 3] = palette[selector * 4 + 3];
        }
      }
    }
  }
}
function decodeDxt1(src, width, height) {
  const out = new Uint8Array(width * height * 4);
  decodeColorBlocks(src, out, width, height, 8, 0, true);
  return out;
}
function decodeDxt3(src, width, height) {
  const out = new Uint8Array(width * height * 4);
  decodeColorBlocks(src, out, width, height, 16, 8, false);
  const view = new DataView(src.buffer, src.byteOffset, src.byteLength);
  const blocksX = Math.ceil(width / 4);
  const blocksY = Math.ceil(height / 4);
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const base = (by * blocksX + bx) * 16;
      const alphaLo = view.getUint32(base, true);
      const alphaHi = view.getUint32(base + 4, true);
      for (let i = 0; i < 16; i++) {
        const x = bx * 4 + i % 4;
        const y = by * 4 + (i / 4 | 0);
        if (x >= width || y >= height) continue;
        const nibble = i < 8 ? alphaLo >> 4 * i & 15 : alphaHi >> 4 * (i - 8) & 15;
        out[(y * width + x) * 4 + 3] = nibble * 17;
      }
    }
  }
  return out;
}
function decodeDxt5(src, width, height) {
  const out = new Uint8Array(width * height * 4);
  decodeColorBlocks(src, out, width, height, 16, 8, false);
  const blocksX = Math.ceil(width / 4);
  const blocksY = Math.ceil(height / 4);
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const base = (by * blocksX + bx) * 16;
      const a0 = src[base];
      const a1 = src[base + 1];
      const alphas = new Uint8Array(8);
      alphas[0] = a0;
      alphas[1] = a1;
      if (a0 > a1) {
        for (let k = 2; k < 8; k++) alphas[k] = ((8 - k) * a0 + (k - 1) * a1) / 7 | 0;
      } else {
        for (let k = 2; k < 6; k++) alphas[k] = ((6 - k) * a0 + (k - 2) * a1) / 5 | 0;
        alphas[6] = 0;
        alphas[7] = 255;
      }
      let bits = src[base + 2] + src[base + 3] * 256 + src[base + 4] * 65536 + src[base + 5] * 16777216 + src[base + 6] * 4294967296 + src[base + 7] * 1099511627776;
      for (let i = 0; i < 16; i++) {
        const x = bx * 4 + i % 4;
        const y = by * 4 + (i / 4 | 0);
        const index = bits % 8;
        bits = Math.floor(bits / 8);
        if (x >= width || y >= height) continue;
        out[(y * width + x) * 4 + 3] = alphas[index];
      }
    }
  }
  return out;
}
function cropToImageRect(decoded, imageWidth, imageHeight) {
  const cropW = Math.min(imageWidth, decoded.width);
  const cropH = Math.min(imageHeight, decoded.height);
  if (cropW > 0 && cropH > 0 && (cropW < decoded.width || cropH < decoded.height)) {
    const cropped = new Uint8Array(cropW * cropH * 4);
    for (let y = 0; y < cropH; y++) {
      cropped.set(decoded.rgba.subarray(y * decoded.width * 4, (y * decoded.width + cropW) * 4), y * cropW * 4);
    }
    return { width: cropW, height: cropH, rgba: cropped };
  }
  return decoded;
}
function decodeTex(data) {
  const parsed = parseTexInternal(data);
  if (parsed.isVideoMp4) {
    throw new Error("tex: video mp4 textures cannot be decoded to a static frame");
  }
  const mip = parsed.mipmaps[0];
  if (isPngBuffer(mip.bytes)) {
    return decodePngToRgba(mip.bytes);
  }
  if (mip.bytes[0] === 255 && mip.bytes[1] === 216) {
    const jpeg = (0, import_jpeg_js.decode)(Buffer2.from(mip.bytes), { useTArray: true });
    const rgba = jpeg.data;
    return cropToImageRect({ width: jpeg.width, height: jpeg.height, rgba }, parsed.width, parsed.height);
  }
  const { width, height, bytes } = mip;
  let decoded;
  switch (parsed.format) {
    case TexFormat.RGBA8888: {
      if (bytes.length < width * height * 4) {
        throw new Error(
          "tex: mipmap size mismatch for RGBA8888 (actual " + bytes.length + " < expected " + width * height * 4 + ")"
        );
      }
      decoded = { width, height, rgba: bytes.slice(0, width * height * 4) };
      break;
    }
    case TexFormat.R8: {
      if (bytes.length < width * height) throw new Error("tex: mipmap size mismatch for R8");
      const rgba = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        rgba[i * 4] = bytes[i];
        rgba[i * 4 + 1] = bytes[i];
        rgba[i * 4 + 2] = bytes[i];
        rgba[i * 4 + 3] = 255;
      }
      decoded = { width, height, rgba };
      break;
    }
    case TexFormat.RG88: {
      if (bytes.length < width * height * 2) throw new Error("tex: mipmap size mismatch for RG88");
      const rgba = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        rgba[i * 4] = bytes[i * 2];
        rgba[i * 4 + 1] = bytes[i * 2 + 1];
        rgba[i * 4 + 2] = 0;
        rgba[i * 4 + 3] = 255;
      }
      decoded = { width, height, rgba };
      break;
    }
    case TexFormat.DXT1: {
      const expected = Math.ceil(width / 4) * Math.ceil(height / 4) * 8;
      if (bytes.length < expected) throw new Error("tex: mipmap size mismatch for DXT1");
      decoded = { width, height, rgba: decodeDxt1(bytes, width, height) };
      break;
    }
    case TexFormat.DXT3: {
      const expected = Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
      if (bytes.length < expected) throw new Error("tex: mipmap size mismatch for DXT3");
      decoded = { width, height, rgba: decodeDxt3(bytes, width, height) };
      break;
    }
    case TexFormat.DXT5: {
      const expected = Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
      if (bytes.length < expected) throw new Error("tex: mipmap size mismatch for DXT5");
      decoded = { width, height, rgba: decodeDxt5(bytes, width, height) };
      break;
    }
    default:
      throw new TexUnsupportedError(
        parsed.format,
        TEX_FORMAT_NAMES[parsed.format] ?? "unknown(" + parsed.format + ")",
        parsed.width,
        parsed.height
      );
  }
  return cropToImageRect(decoded, parsed.width, parsed.height);
}
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let c = 4294967295;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function pngChunk(type, data) {
  const out = Buffer2.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  out.set(data, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function encodePng(width, height, rgba) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("png: invalid dimensions " + width + "x" + height);
  }
  if (rgba.length !== width * height * 4) {
    throw new Error("png: rgba buffer size mismatch");
  }
  const stride = width * 4 + 1;
  const raw = Buffer2.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * stride + 1);
  }
  const ihdr = Buffer2.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer2.concat([
    Buffer2.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer2.alloc(0))
  ]);
}
function collectImageObjectTextures(imageObject, readJson) {
  const out = [];
  const pushTextureList = (list) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      const rawName = typeof item === "string" ? item : item && typeof item === "object" && typeof item.name === "string" ? item.name : item && typeof item === "object" && typeof item.file === "string" ? item.file : null;
      if (!rawName) continue;
      if (rawName.toLowerCase().endsWith(".tex")) {
        out.push(rawName);
      } else {
        out.push(rawName + ".tex");
        out.push("materials/" + rawName + ".tex");
      }
    }
  };
  const ref = imageObject.image;
  if (ref.toLowerCase().endsWith(".tex")) {
    out.push(ref);
  } else {
    let materialJson = readJson(ref);
    if (materialJson && typeof materialJson.material === "string") {
      const matRef = materialJson.material;
      materialJson = readJson(matRef) ?? readJson("materials/" + matRef);
    }
    if (materialJson && Array.isArray(materialJson.passes)) {
      for (const pass of materialJson.passes) pushTextureList(pass?.textures);
    }
  }
  const instance = imageObject.instance;
  if (instance && typeof instance === "object") pushTextureList(instance.textures);
  return out;
}
function pkgSceneAccess(pkgData) {
  const entries = parsePkg(pkgData);
  const byPath = new Map(entries.map((entry) => [entry.path.toLowerCase(), entry]));
  const readFile = (path2) => {
    const entry = byPath.get(path2.toLowerCase());
    if (!entry) return null;
    return { path: entry.path, bytes: readPkgEntry(pkgData, entry) };
  };
  return {
    readJson: (path2) => {
      const file = readFile(path2);
      if (!file) return null;
      try {
        return JSON.parse(textDecoder.decode(file.bytes));
      } catch {
        return null;
      }
    },
    readFile,
    listTexPaths: () => entries.filter((entry) => entry.path.toLowerCase().endsWith(".tex")).map((entry) => entry.path)
  };
}
function isPngBuffer(buf) {
  return buf.length >= 8 && buf[0] === 137 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71 && buf[4] === 13 && buf[5] === 10 && buf[6] === 26 && buf[7] === 10;
}
function isLikelyMaskOrHelper(path2) {
  const lower = path2.toLowerCase();
  return lower.includes("/masks/") || lower.includes("_mask") || lower.includes("mask") || lower.includes("flow") || lower.includes("wave") || lower.includes("noise") || lower.includes("lut") || lower.includes("distort") || lower.includes("warp") || lower.includes("vortex") || lower.includes("glow") || lower.includes("neon") || lower.includes("strip") || lower.includes("bulb") || lower.includes("led") || lower.includes("combined") || lower.includes("isometric") || lower.includes("razer") || lower.includes("len") || lower.includes("lens") || lower.includes("flare") || lower.includes("prism") || lower.includes("diffract") || lower.includes("black") || lower.includes("overlay") || lower === "sun" || lower.endsWith("/sun.tex") || lower.endsWith("/sun.json") || lower.endsWith("/sun") || lower.includes("waterripple") || lower.includes("waterflow") || lower.includes("phase") || lower.includes("normal") || lower.includes("foliagesway") || lower.includes("cursorripple") || lower.includes("\u8D5E\u52A9") || lower.includes("sponsor") || lower.includes("donate") || lower.includes("qrcode") || lower.includes("qr_code") || lower.includes("audio_bar") || lower.includes("audiobar") || lower.includes("simple_audio") || lower.includes("\u63D0\u793A\u6846") || lower.includes("tip") || lower.includes("watermark") || lower.includes("logo") || lower.includes("particle") || lower.includes("audio") || lower.includes("lightmap") || lower.includes("light_map") || lower.includes("visso") || lower.includes("font") || lower.includes("text_");
}
function hasContent(rgba, width, height) {
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 1e3));
  let visibleCount = 0;
  let sampleCount = 0;
  for (let i = 0; i < totalPixels; i += step) {
    sampleCount++;
    const idx = i * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];
    const a = rgba[idx + 3];
    if (a > 10 && (r > 0 || g > 0 || b > 0)) {
      visibleCount++;
    }
  }
  return sampleCount === 0 || visibleCount / sampleCount >= 0.01;
}
function sceneProjectionSize(scene) {
  const general = scene.general;
  const rawW = general?.orthogonalprojection?.width;
  const rawH = general?.orthogonalprojection?.height;
  const width = typeof rawW === "number" && Number.isFinite(rawW) && rawW > 0 ? Math.floor(rawW) : 0;
  const height = typeof rawH === "number" && Number.isFinite(rawH) && rawH > 0 ? Math.floor(rawH) : 0;
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}
function cropToProjection(rgba, width, height, projection) {
  if (!projection) return null;
  const sourceRatio = width / height;
  const targetRatio = projection.width / projection.height;
  if (Math.abs(sourceRatio - targetRatio) < 5e-3) return null;
  let outWidth = width;
  let outHeight = height;
  if (sourceRatio > targetRatio) {
    outWidth = Math.floor(height * targetRatio);
    if (outWidth >= width) return null;
  } else {
    outHeight = Math.floor(width / targetRatio);
    if (outHeight >= height) return null;
  }
  const startX = Math.max(0, Math.floor((width - outWidth) / 2));
  const startY = Math.max(0, Math.floor((height - outHeight) / 2));
  const out = new Uint8Array(outWidth * outHeight * 4);
  for (let y = 0; y < outHeight; y++) {
    const srcStart = ((startY + y) * width + startX) * 4;
    out.set(rgba.subarray(srcStart, srcStart + outWidth * 4), y * outWidth * 4);
  }
  return { width: outWidth, height: outHeight, rgba: out };
}
function getTextureScore(path2) {
  const lower = path2.toLowerCase();
  if (isLikelyMaskOrHelper(path2)) return -100;
  let score = 0;
  if (lower.includes("\u767D\u5929") || lower.includes("day") || lower.includes("main") || lower.includes("background") || lower.includes("wallpaper")) {
    score += 50;
  }
  if (lower.includes("\u6E05\u6668") || lower.includes("morning") || lower.includes("\u9EC4\u660F") || lower.includes("dusk")) {
    score += 20;
  }
  if (lower.includes("\u663C\u591C\u53D8\u5316") || lower.includes("mddn") || lower.includes("transition")) {
    score -= 30;
  }
  return score;
}
function tryCompositeMultiLayerScene(scene, access, topCandidate) {
  const objects = Array.isArray(scene.objects) ? scene.objects : [];
  const imageObjects = objects.filter(
    (obj) => obj && typeof obj === "object" && typeof obj.image === "string" && !String(obj.image).startsWith("models/util/") && !isLikelyMaskOrHelper(String(obj.image))
  );
  if (imageObjects.length <= 1) return null;
  let canvasWidth = 1920;
  let canvasHeight = 1080;
  const layers = [];
  const layerSources = [];
  let hasLargeBase = false;
  for (const obj of objects) {
    if (!obj.image || typeof obj.image !== "string" || obj.image.startsWith("models/util/")) continue;
    if (obj.visible && typeof obj.visible === "object" && obj.visible.value === false) continue;
    if (typeof obj.name === "string") {
      const nameLower = obj.name.toLowerCase();
      if (nameLower.includes("black") || nameLower.includes("len") || nameLower.includes("util") || nameLower.includes("flare") || nameLower.includes("blend") || nameLower === "sun" || nameLower === "sun2") {
        continue;
      }
    }
    if (isLikelyMaskOrHelper(obj.image)) continue;
    const modelJson = access.readJson(obj.image);
    if (!modelJson || typeof modelJson.material !== "string") continue;
    const matJson = access.readJson(modelJson.material);
    if (!matJson || !Array.isArray(matJson.passes)) continue;
    const passes = matJson.passes;
    const texName = passes[0]?.textures?.[0];
    if (!texName || isLikelyMaskOrHelper(texName)) continue;
    const texPath = access.listTexPaths().find(
      (p) => p.toLowerCase() === texName.toLowerCase() || p.toLowerCase() === ("materials/" + texName + ".tex").toLowerCase() || p.toLowerCase() === (texName + ".tex").toLowerCase() || p.toLowerCase().endsWith("/" + texName.toLowerCase() + ".tex") || p.toLowerCase().endsWith("/" + texName.toLowerCase())
    );
    if (!texPath) continue;
    const file = access.readFile(texPath);
    if (!file) continue;
    let decoded = null;
    try {
      decoded = decodeTex(file.bytes);
    } catch {
      continue;
    }
    if (!decoded || decoded.width < 64 || decoded.height < 64) continue;
    if (decoded.width >= 1280 || decoded.height >= 720) {
      hasLargeBase = true;
    }
    if (decoded.width > canvasWidth || decoded.height > canvasHeight) {
      canvasWidth = Math.max(canvasWidth, decoded.width);
      canvasHeight = Math.max(canvasHeight, decoded.height);
    }
    let ox = 0;
    let oy = 0;
    if (typeof modelJson.cropoffset === "string") {
      const parts = modelJson.cropoffset.trim().split(/\s+/);
      ox = parseFloat(parts[0]) || 0;
      oy = parseFloat(parts[1]) || 0;
    }
    const centerX = canvasWidth / 2 + ox;
    const centerY = canvasHeight / 2 - oy;
    const startX = Math.round(centerX - decoded.width / 2);
    const startY = Math.round(centerY - decoded.height / 2);
    layers.push({ x: startX, y: startY, width: decoded.width, height: decoded.height, rgba: decoded.rgba });
    layerSources.push(texPath);
  }
  if (imageObjects.length >= 3 && layers.length <= 1) {
    throw new Error("pkg: multi-layer scene composition requires full preview render");
  }
  if (layers.length <= 1 || !hasLargeBase) return null;
  if (topCandidate !== null && !layerSources.some((p) => p.toLowerCase() === topCandidate.toLowerCase())) {
    return null;
  }
  const canvas = new Uint8Array(canvasWidth * canvasHeight * 4);
  for (const layer of layers) {
    for (let y = 0; y < layer.height; y++) {
      const cy = layer.y + y;
      if (cy < 0 || cy >= canvasHeight) continue;
      for (let x = 0; x < layer.width; x++) {
        const cx = layer.x + x;
        if (cx < 0 || cx >= canvasWidth) continue;
        const si = (y * layer.width + x) * 4;
        const di = (cy * canvasWidth + cx) * 4;
        const sa = layer.rgba[si + 3] / 255;
        if (sa <= 0) continue;
        const da = canvas[di + 3] / 255;
        const outA = sa + da * (1 - sa);
        if (outA <= 0) continue;
        canvas[di] = Math.round((layer.rgba[si] * sa + canvas[di] * da * (1 - sa)) / outA);
        canvas[di + 1] = Math.round((layer.rgba[si + 1] * sa + canvas[di + 1] * da * (1 - sa)) / outA);
        canvas[di + 2] = Math.round((layer.rgba[si + 2] * sa + canvas[di + 2] * da * (1 - sa)) / outA);
        canvas[di + 3] = Math.round(outA * 255);
      }
    }
  }
  return {
    width: canvasWidth,
    height: canvasHeight,
    png: Buffer2.from(encodePng(canvasWidth, canvasHeight, canvas)),
    texturePath: "composite(" + String(layers.length) + " layers)"
  };
}
function extractSceneMainImageVia(access, label) {
  let scene = access.readJson("scene.json");
  if (!scene) {
    const project = access.readJson("project.json");
    if (project && typeof project.file === "string" && project.file.endsWith(".json")) {
      scene = access.readJson(project.file);
    }
  }
  if (!scene || !Array.isArray(scene.objects)) {
    throw new Error(label + ": scene.json not found or invalid");
  }
  const projection = sceneProjectionSize(scene);
  const has3dModels = scene.objects.some(
    (obj) => obj && typeof obj === "object" && typeof obj.model === "string" && obj.model.length > 0
  );
  if (has3dModels) {
    throw new Error(label + ": 3D scene cannot be extracted as 2D frame");
  }
  const rawCandidates = [];
  for (const obj of scene.objects) {
    if (obj && typeof obj === "object" && typeof obj.image === "string") {
      rawCandidates.push(...collectImageObjectTextures(obj, access.readJson));
    }
  }
  const allCandidates = [];
  for (const p of rawCandidates) {
    if (!isLikelyMaskOrHelper(p) && !allCandidates.some((c) => c.path.toLowerCase() === p.toLowerCase())) {
      allCandidates.push({ path: p, fromObject: true });
    }
  }
  for (const p of access.listTexPaths()) {
    if (!isLikelyMaskOrHelper(p) && !allCandidates.some((c) => c.path.toLowerCase() === p.toLowerCase())) {
      allCandidates.push({ path: p, fromObject: false });
    }
  }
  const ranked = allCandidates.map(({ path: path2, fromObject }) => {
    let area = 0;
    try {
      const file = access.readFile(path2);
      const info = file ? parseTex(file.bytes) : null;
      if (info) area = info.width * info.height;
    } catch {
    }
    const score = getTextureScore(path2) + (fromObject ? 100 : 0);
    return { path: path2, score, area };
  });
  ranked.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.area - a.area;
  });
  const candidates = ranked.map((r) => r.path);
  if (candidates.length === 0) {
    throw new Error(label + ": no texture candidates found");
  }
  const composite = tryCompositeMultiLayerScene(scene, access, candidates[0] ?? null);
  if (composite !== null) {
    return composite;
  }
  let lastError = null;
  for (const path2 of candidates) {
    if (isLikelyMaskOrHelper(path2)) continue;
    const file = access.readFile(path2);
    if (!file) {
      if (lastError === null) {
        lastError = new Error(label + ": texture '" + path2 + "' not found in " + (label === "pkg" ? "package" : "directory"));
      }
      continue;
    }
    try {
      const parsed = parseTexInternal(file.bytes);
      if (parsed.isVideoMp4) {
        throw new Error("tex: video mp4 textures cannot be decoded to a static frame");
      }
      const mip0 = parsed.mipmaps[0];
      if (isPngBuffer(mip0.bytes)) {
        const png = Buffer2.from(mip0.bytes);
        if (projection) {
          const decoded = decodePngToRgba(mip0.bytes);
          const cropped2 = cropToProjection(decoded.rgba, decoded.width, decoded.height, projection);
          if (cropped2) {
            return {
              width: cropped2.width,
              height: cropped2.height,
              png: encodePng(cropped2.width, cropped2.height, cropped2.rgba),
              texturePath: file.path
            };
          }
        }
        return { width: mip0.width, height: mip0.height, png, texturePath: file.path };
      }
      const { width, height, rgba } = decodeTex(file.bytes);
      if (!hasContent(rgba, width, height)) {
        lastError = new Error(label + ": texture '" + path2 + "' is a shader mask or partial layer");
        continue;
      }
      const cropped = cropToProjection(rgba, width, height, projection);
      if (cropped) {
        return { width: cropped.width, height: cropped.height, png: encodePng(cropped.width, cropped.height, cropped.rgba), texturePath: file.path };
      }
      return { width, height, png: encodePng(width, height, rgba), texturePath: file.path };
    } catch (err) {
      if (err instanceof TexUnsupportedError && path2 === candidates[0]) throw err;
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(label + ": no decodable texture found");
}
function extractSceneMainImage(pkgData) {
  return extractSceneMainImageVia(pkgSceneAccess(pkgData), "pkg");
}
function embeddedMp4Bytes(raw) {
  for (let i = 0; i < 200 && i + 8 <= raw.length; i++) {
    if (raw[i] !== 102 || raw[i + 1] !== 116 || raw[i + 2] !== 121 || raw[i + 3] !== 112) continue;
    const ftypOffset = i - 4;
    if (ftypOffset >= 0 && ftypOffset < raw.length) return raw.slice(ftypOffset);
  }
  return null;
}
function extractSceneVideoVia(access) {
  const candidates = [];
  for (const path2 of access.listTexPaths()) {
    const file = access.readFile(path2);
    if (!file) continue;
    const bytes = embeddedMp4Bytes(file.bytes);
    if (bytes !== null) {
      candidates.push({ path: path2, score: getTextureScore(path2), bytes });
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].bytes;
}
function extractSceneVideo(pkgData) {
  return extractSceneVideoVia(pkgSceneAccess(pkgData));
}
var MDL_FLAG_NORMAL = 2;
var MDL_FLAG_TANGENT = 4;
var MDL_FLAG_UV = 8;
var MDL_FLAG_UV2 = 32;
var MDL_FLAG_EXTRA4 = 65536;
var MDL_FLAG_SKIN_BLEND = 8388608;
var MDL_FLAG_SKIN_WEIGHT = 16777216;
function mdlVertexStride(flag) {
  let s = 12;
  if (flag & MDL_FLAG_NORMAL) s += 12;
  if (flag & MDL_FLAG_TANGENT) s += 16;
  if (flag & MDL_FLAG_EXTRA4) s += 4;
  if (flag & MDL_FLAG_SKIN_BLEND) s += 16;
  if (flag & MDL_FLAG_SKIN_WEIGHT) s += 16;
  if (flag & (MDL_FLAG_UV | MDL_FLAG_UV2)) s += 8;
  if (flag & MDL_FLAG_UV2) s += 8;
  return s;
}
function readMdlCString(buf, p) {
  let end = p;
  while (end < buf.length && buf[end] !== 0) end++;
  if (end >= buf.length) return null;
  let str = "";
  for (let i = p; i < end; i++) str += String.fromCharCode(buf[i]);
  return { str, next: end + 1 };
}
function parseMdl(buf) {
  if (buf.length < 21) return [];
  const magic = String.fromCharCode(...buf.slice(0, 4));
  if (magic !== "MDLV") return [];
  const mdlv = parseInt(String.fromCharCode(...buf.slice(4, 8)), 10);
  if (!Number.isFinite(mdlv) || mdlv < 1) return [];
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = 9;
  const mdlFlag = dv.getUint32(p, true);
  p += 4;
  const skinCount = dv.getUint32(p, true);
  p += 4;
  const meshCount = dv.getUint32(p, true);
  p += 4;
  if (skinCount < 1 || skinCount > 64 || meshCount < 1 || meshCount > 1024) return [];
  const meshes = [];
  for (let m = 0; m < meshCount; m++) {
    const materials = [];
    for (let s = 0; s < skinCount; s++) {
      const cstr = readMdlCString(buf, p);
      if (!cstr) return meshes;
      materials.push(cstr.str);
      p = cstr.next;
    }
    if (p + 8 > buf.length) return meshes;
    const flagA = dv.getUint32(p, true);
    p += 4;
    if (flagA === 2) p += 4;
    if (mdlv >= 17) p += 24;
    let meshFlag = mdlFlag;
    if (mdlv > 14) {
      if (p + 8 > buf.length) return meshes;
      meshFlag = dv.getUint32(p, true);
      p += 4;
    }
    const vBytes = dv.getUint32(p, true);
    p += 4;
    const stride = mdlVertexStride(meshFlag);
    if (vBytes < stride || vBytes > 1e8 || vBytes % stride !== 0 || p + vBytes + 4 > buf.length) return meshes;
    const vCount = vBytes / stride;
    const pos = new Float32Array(vCount * 3);
    const norm = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const uv2 = (meshFlag & MDL_FLAG_UV2) !== 0 ? new Float32Array(vCount * 2) : void 0;
    const hasNorm = (meshFlag & MDL_FLAG_NORMAL) !== 0;
    const hasUv = (meshFlag & (MDL_FLAG_UV | MDL_FLAG_UV2)) !== 0;
    for (let v = 0; v < vCount; v++) {
      pos[v * 3] = dv.getFloat32(p, true);
      pos[v * 3 + 1] = dv.getFloat32(p + 4, true);
      pos[v * 3 + 2] = dv.getFloat32(p + 8, true);
      p += 12;
      if (hasNorm) {
        norm[v * 3] = dv.getFloat32(p, true);
        norm[v * 3 + 1] = dv.getFloat32(p + 4, true);
        norm[v * 3 + 2] = dv.getFloat32(p + 8, true);
        p += 12;
      } else {
        norm[v * 3 + 1] = 1;
      }
      if (meshFlag & MDL_FLAG_TANGENT) p += 16;
      if (meshFlag & MDL_FLAG_EXTRA4) p += 4;
      if (meshFlag & MDL_FLAG_SKIN_BLEND) p += 16;
      if (meshFlag & MDL_FLAG_SKIN_WEIGHT) p += 16;
      if (hasUv) {
        uv[v * 2] = dv.getFloat32(p, true);
        uv[v * 2 + 1] = dv.getFloat32(p + 4, true);
        p += 8;
      }
      if (uv2) {
        uv2[v * 2] = dv.getFloat32(p, true);
        uv2[v * 2 + 1] = dv.getFloat32(p + 4, true);
        p += 8;
      }
    }
    if (p + 4 > buf.length) return meshes;
    const iBytes = dv.getUint32(p, true);
    p += 4;
    if (iBytes < 2 || iBytes > 6e7 || p + iBytes > buf.length) return meshes;
    const useU32 = vCount > 65535 && (mdlv >= 23 || iBytes % 12 === 0);
    const iCount = Math.floor(iBytes / (useU32 ? 4 : 2));
    let indices;
    if (useU32) {
      const arr = new Uint32Array(iCount);
      for (let i = 0; i < iCount; i++) arr[i] = dv.getUint32(p + i * 4, true);
      indices = arr;
    } else {
      const arr = new Uint16Array(iCount);
      for (let i = 0; i < iCount; i++) arr[i] = dv.getUint16(p + i * 2, true);
      indices = arr;
    }
    p += iBytes;
    meshes.push({ vCount, iCount, pos, norm, uv, uv2, indices, materialPath: materials[0] });
  }
  return meshes;
}
function containsEmbeddedScript(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (!Array.isArray(value)) {
    const record = value;
    if (typeof record.script === "string" && record.script.trim() !== "") return true;
  }
  return Object.values(value).some((child) => containsEmbeddedScript(child, seen));
}
function buildSceneManifestVia(access, token, projectOverride) {
  let scene = access.readJson("scene.json");
  const project = projectOverride && typeof projectOverride === "object" ? projectOverride : access.readJson("project.json");
  if (!scene && project && typeof project.file === "string" && project.file.endsWith(".json")) {
    scene = access.readJson(project.file);
  }
  if (!scene || !Array.isArray(scene.objects)) return null;
  const general = scene.general;
  const projW = general?.orthogonalprojection?.width;
  const projH = general?.orthogonalprojection?.height;
  const width = typeof projW === "number" && Number.isFinite(projW) && projW > 0 ? Math.floor(projW) : 3840;
  const height = typeof projH === "number" && Number.isFinite(projH) && projH > 0 ? Math.floor(projH) : 2160;
  const resourceBase = "/api/skin-center/we/scene-resource/" + token + "/";
  const resourceUrl = (pkgPath2) => resourceBase + pkgPath2.split("/").map(encodeURIComponent).join("/");
  const manifest = {
    width,
    height,
    hasMeteors: false,
    hasFireflies: false,
    scripted: containsEmbeddedScript(scene),
    layers: []
  };
  const allTex = access.listTexPaths();
  const parseVec3 = (val, def) => {
    if (typeof val === "string") {
      const parts = val.trim().split(/\s+/).map(parseFloat);
      if (parts.length >= 3 && !parts.some(isNaN)) return [parts[0], parts[1], parts[2]];
    }
    return def;
  };
  manifest.clearColor = parseVec3(general?.clearcolor, [0.1, 0.1, 0.15]);
  manifest.ambientColor = parseVec3(general?.ambientcolor, [0, 0, 0]);
  manifest.skyLightColor = parseVec3(general?.skylightcolor, [0, 0, 0]);
  const pointLights = scene.objects.filter((obj) => obj.light === "point").slice(0, 4).map((obj) => {
    const intensity = typeof obj.intensity === "number" && Number.isFinite(obj.intensity) ? Math.max(0, obj.intensity) : 1;
    const color = parseVec3(obj.color, [1, 1, 1]);
    return {
      origin: parseVec3(obj.origin, [0, 0, 0]),
      color: color.map((channel) => channel * intensity),
      radius: typeof obj.radius === "number" && Number.isFinite(obj.radius) && obj.radius > 0 ? obj.radius : 1
    };
  });
  if (pointLights.length > 0) manifest.pointLights = pointLights;
  const props = project?.general?.properties;
  const propertyValue = (name) => props?.[name]?.value;
  const boundedHour = (name, fallback) => {
    const raw = propertyValue(name);
    const numeric = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
    return Number.isFinite(numeric) && numeric >= 0 && numeric < 24 ? numeric : fallback;
  };
  const timeVarying = propertyValue("timevarying") === true;
  const timePeriods = /* @__PURE__ */ new Set(["morning", "day", "dusk", "night", "mddn"]);
  if (timeVarying && scene.objects.some((obj) => timePeriods.has(String(obj.name).toLowerCase()))) {
    manifest.timeSchedule = {
      morning: boundedHour("morningtime", 4),
      day: boundedHour("daytime", 8),
      dusk: boundedHour("dusktime", 17),
      night: boundedHour("nighttime", 20)
    };
  }
  if (props?.schemecolor?.value && typeof props.schemecolor.value === "string") {
    manifest.clearColor = parseVec3(props.schemecolor.value, [0.57, 0.71, 0.81]);
  }
  if (props?.carbodycolor?.value && typeof props.carbodycolor.value === "string") {
    manifest.carBodyColor = parseVec3(props.carbodycolor.value, [1, 0, 0]);
  }
  if (props?.carstripescolor?.value && typeof props.carstripescolor.value === "string") {
    manifest.carStripesColor = parseVec3(props.carstripescolor.value, [0, 0, 0]);
  }
  const is3D = Boolean(scene.camera) || scene.objects.some((o) => typeof o.model === "string" && o.model.endsWith(".mdl"));
  if (is3D) {
    manifest.is3D = true;
    const cam = scene.camera;
    let eye = parseVec3(cam?.eye, [0, 1.5, 4]);
    let center = parseVec3(cam?.center, [0, 0, 0]);
    let up = parseVec3(cam?.up, [0, 1, 0]);
    if (cam?.paths && Array.isArray(cam.paths) && typeof cam.paths[0] === "string") {
      const pathJson = access.readJson(cam.paths[0]);
      const firstTf = pathJson?.paths?.[0]?.transforms?.[0];
      if (firstTf) {
        if (firstTf.eye) eye = parseVec3(firstTf.eye, eye);
        if (firstTf.center) center = parseVec3(firstTf.center, center);
        if (firstTf.up) up = parseVec3(firstTf.up, up);
      }
      if (pathJson?.paths && pathJson.paths.length > 0) {
        manifest.cameraPaths = [];
        for (const seg of pathJson.paths) {
          if (!seg.transforms || seg.transforms.length < 2) continue;
          if (typeof seg.duration !== "number" || !Number.isFinite(seg.duration) || seg.duration <= 0) continue;
          const t0 = seg.transforms[0];
          const t1 = seg.transforms[seg.transforms.length - 1];
          manifest.cameraPaths.push({
            d: seg.duration,
            e0: parseVec3(t0.eye, eye),
            c0: parseVec3(t0.center, center),
            u0: parseVec3(t0.up, up),
            e1: parseVec3(t1.eye, eye),
            c1: parseVec3(t1.center, center),
            u1: parseVec3(t1.up, up)
          });
        }
        if (manifest.cameraPaths.length === 0) delete manifest.cameraPaths;
      }
    }
    const cameraFov = cam?.fov;
    const generalFov = general?.fov;
    const validFov = (value) => typeof value === "number" && Number.isFinite(value) && value > 0 && value < 180;
    manifest.camera = {
      eye,
      center,
      up,
      // Wallpaper Engine serializes the projection FOV under scene.general;
      // a few older projects put it on the camera itself. Prefer the explicit
      // camera value, then the authored general value, then WE's 50-degree
      // default. Falling back to 45 over-zooms official scenes such as Arsenal.
      fov: validFov(cameraFov) ? cameraFov : validFov(generalFov) ? generalFov : 50
    };
    if (cam && !(manifest.cameraPaths && manifest.cameraPaths.length > 0)) {
      manifest.cameraStatic = true;
    }
    manifest.models = [];
    for (const obj of scene.objects) {
      if (typeof obj.model !== "string" || !obj.model.endsWith(".mdl")) continue;
      const mdlFile = access.readFile(obj.model);
      if (!mdlFile) continue;
      const decodedMeshes = parseMdl(mdlFile.bytes);
      if (decodedMeshes.length === 0) continue;
      const baseName = obj.model.split("/").pop()?.replace(/\.mdl$/i, "");
      const resolveTexRef = (ref) => {
        const want = ref.toLowerCase().replace(/\.tex$/i, "");
        return allTex.find((p) => {
          const lower = p.toLowerCase().replace(/\.tex$/i, "");
          return lower === want || lower === "materials/" + want || lower.endsWith("/" + want);
        });
      };
      const meshes = decodedMeshes.map((m) => {
        let subTex;
        let shader;
        let additive;
        let noDepthTest;
        let noDepthWrite;
        let tint;
        let tint2;
        let texPath2;
        let lightmapPath;
        let translucent;
        let gradFade;
        let userColors;
        let userNums;
        if (m.materialPath) {
          try {
            const matJsonRaw = access.readJson(m.materialPath);
            const pass0 = Array.isArray(matJsonRaw?.passes) ? matJsonRaw.passes[0] : void 0;
            if (pass0) {
              if (typeof pass0.shader === "string") shader = pass0.shader;
              if (pass0.blending === "additive") additive = true;
              if (pass0.blending === "translucent") translucent = true;
              const combos = pass0.combos;
              if (combos && combos.GRADIENT_FADE) gradFade = true;
              const dt = pass0.depthtesting ?? pass0.depthtest;
              const dw = pass0.depthwriting ?? pass0.depthwrite;
              if (dt === "disabled") noDepthTest = true;
              if (dw === "disabled") noDepthWrite = true;
              if (Array.isArray(pass0.textures) && pass0.textures.length > 0) {
                const texturePaths = pass0.textures.map((texture) => resolveTexRef(String(texture)));
                subTex = texturePaths[0];
                if (texturePaths.length > 1) texPath2 = texturePaths[1];
                if (combos?.lightmap) {
                  lightmapPath = texturePaths[combos?.normalmap ? 2 : 1];
                }
              }
              const usv = pass0.usershadervalues;
              if (usv) {
                for (const [key, uniformName] of Object.entries(usv)) {
                  if (typeof uniformName !== "string") continue;
                  const propDef = props?.[key];
                  const pv = propDef?.value;
                  if (typeof pv === "string") {
                    const col = parseVec3(pv, [1, 1, 1]);
                    if (uniformName === "tint") tint = col;
                    else if (uniformName === "tint2") tint2 = col;
                    userColors = userColors ?? {};
                    userColors[uniformName] = col;
                  } else if (typeof pv === "number" && Number.isFinite(pv)) {
                    userNums = userNums ?? {};
                    userNums[uniformName] = pv;
                  }
                }
              }
              const csv = pass0.constantshadervalues;
              if (csv) {
                for (const [key, val] of Object.entries(csv)) {
                  if (typeof val === "number" && Number.isFinite(val)) {
                    userNums = userNums ?? {};
                    userNums[key] = val;
                  }
                }
              }
            }
          } catch {
          }
          if (!subTex) {
            const matBaseName = m.materialPath.replace(/\.json$/i, "").split("/").pop();
            if (matBaseName) {
              subTex = allTex.find((p) => {
                const lower = p.toLowerCase();
                return lower.includes(matBaseName.toLowerCase()) && !lower.includes("normal") && !lower.includes("mask");
              });
            }
          }
        }
        if (!subTex && baseName) {
          subTex = allTex.find((p) => p.toLowerCase().includes(baseName.toLowerCase()) && !p.toLowerCase().includes("normal") && !p.toLowerCase().includes("mask"));
        }
        return {
          vCount: m.vCount,
          iCount: m.iCount,
          posB64: Buffer2.from(m.pos.buffer, m.pos.byteOffset, m.pos.byteLength).toString("base64"),
          normB64: Buffer2.from(m.norm.buffer, m.norm.byteOffset, m.norm.byteLength).toString("base64"),
          uvB64: Buffer2.from(m.uv.buffer, m.uv.byteOffset, m.uv.byteLength).toString("base64"),
          uv2B64: m.uv2 ? Buffer2.from(m.uv2.buffer, m.uv2.byteOffset, m.uv2.byteLength).toString("base64") : void 0,
          indicesB64: Buffer2.from(m.indices.buffer, m.indices.byteOffset, m.indices.byteLength).toString("base64"),
          idx32: m.indices instanceof Uint32Array || void 0,
          texUrl: subTex ? resourceUrl(subTex) : void 0,
          repeatBase: m.uv.some((value) => value < 0 || value > 1) || void 0,
          materialPath: m.materialPath,
          shader,
          additive,
          noDepthTest,
          noDepthWrite,
          tint,
          tint2,
          texUrl2: texPath2 ? resourceUrl(texPath2) : void 0,
          lightmapUrl: lightmapPath ? resourceUrl(lightmapPath) : void 0,
          translucent,
          gradFade,
          userColors,
          userNums
        };
      });
      manifest.models.push({
        name: typeof obj.name === "string" ? obj.name : "model",
        origin: parseVec3(obj.origin, [0, 0, 0]),
        angles: parseVec3(obj.angles, [0, 0, 0]),
        scale: parseVec3(obj.scale, [1, 1, 1]),
        meshes
      });
    }
    for (const obj of scene.objects) {
      if (typeof obj.image === "string" && !obj.image.startsWith("models/util/")) {
        const layerJson = access.readJson(obj.image);
        if (layerJson?.fullscreen === true && typeof layerJson.material === "string") {
          const matJson = access.readJson(layerJson.material);
          const pass0 = Array.isArray(matJson?.passes) ? matJson.passes[0] : void 0;
          if (pass0) {
            let texPath;
            if (Array.isArray(pass0.textures)) {
              for (const t of pass0.textures) {
                const ref = String(t);
                if (ref.startsWith("_rt_")) continue;
                const want = ref.toLowerCase().replace(/\.tex$/i, "");
                texPath = allTex.find((p) => {
                  const lower = p.toLowerCase().replace(/\.tex$/i, "");
                  return lower === want || lower === "materials/" + want || lower.endsWith("/" + want);
                });
                if (texPath) break;
              }
            }
            const userColors = {};
            const userNums = {};
            const usv = pass0.usershadervalues;
            if (usv) {
              for (const [key, uniformName] of Object.entries(usv)) {
                if (typeof uniformName !== "string") continue;
                const pv = props?.[key]?.value;
                if (typeof pv === "string") userColors[uniformName] = parseVec3(pv, [1, 1, 1]);
                else if (typeof pv === "number" && Number.isFinite(pv)) userNums[uniformName] = pv;
              }
            }
            manifest.bgLayers = manifest.bgLayers ?? [];
            manifest.bgLayers.push({
              name: typeof obj.name === "string" ? obj.name : "fullscreen",
              shader: typeof pass0.shader === "string" ? pass0.shader : void 0,
              texUrl: texPath ? resourceUrl(texPath) : void 0,
              userColors: Object.keys(userColors).length > 0 ? userColors : void 0,
              userNums: Object.keys(userNums).length > 0 ? userNums : void 0
            });
          }
          continue;
        }
      }
      if (typeof obj.sprite === "string") {
        const spriteJson = access.readJson(obj.sprite);
        const pass0 = Array.isArray(spriteJson?.passes) ? spriteJson.passes[0] : void 0;
        let texPath;
        const texRef = Array.isArray(pass0?.textures) ? String(pass0.textures[0] ?? "") : "";
        if (texRef) {
          const want = texRef.toLowerCase().replace(/\.tex$/i, "");
          texPath = allTex.find((p) => {
            const lower = p.toLowerCase().replace(/\.tex$/i, "");
            return lower === want || lower === "materials/" + want || lower.endsWith("/" + want);
          });
        }
        manifest.sprites = manifest.sprites ?? [];
        manifest.sprites.push({
          name: typeof obj.name === "string" ? obj.name : "sprite",
          texUrl: texPath ? resourceUrl(texPath) : void 0,
          origin: parseVec3(obj.origin, [0, 0, 0]),
          scale: parseVec3(obj.scale, [1, 1, 1])
        });
      }
      if (typeof obj.particle === "string") {
        const pj = access.readJson(obj.particle);
        if (!pj) continue;
        const emitter = Array.isArray(pj.emitter) ? pj.emitter[0] : void 0;
        const init = Array.isArray(pj.initializer) ? pj.initializer : [];
        const byName = (n) => init.find((i) => i.name === n);
        const life = byName("lifetimerandom");
        const size = byName("sizerandom");
        const vel = byName("velocityrandom");
        const col = byName("colorrandom");
        let texPath;
        if (typeof pj.material === "string") {
          const matJson = access.readJson(pj.material);
          const pass0 = Array.isArray(matJson?.passes) ? matJson.passes[0] : void 0;
          const texRef = Array.isArray(pass0?.textures) ? String(pass0.textures[0] ?? "") : "";
          if (texRef) {
            const want = texRef.toLowerCase().replace(/\.tex$/i, "");
            texPath = allTex.find((p) => {
              const lower = p.toLowerCase().replace(/\.tex$/i, "");
              return lower === want || lower === "materials/" + want || lower.endsWith("/" + want);
            });
          }
        }
        const num = (v, d) => typeof v === "number" && Number.isFinite(v) ? v : d;
        const objOrigin = parseVec3(obj.origin, [0, 0, 0]);
        const emitterOrigin = parseVec3(emitter?.origin, [0, 0, 0]);
        manifest.particles3d = manifest.particles3d ?? [];
        manifest.particles3d.push({
          name: typeof obj.name === "string" ? obj.name : "particles",
          texUrl: texPath ? resourceUrl(texPath) : void 0,
          origin: [
            objOrigin[0] + emitterOrigin[0],
            objOrigin[1] + emitterOrigin[1],
            objOrigin[2] + emitterOrigin[2]
          ],
          rate: num(emitter?.rate, 30),
          maxCount: num(pj.maxcount, 128),
          lifeMin: num(life?.min, 2),
          lifeMax: num(life?.max, 4),
          sizeMin: num(size?.min, 0.1),
          sizeMax: num(size?.max, 0.15),
          distMin: num(emitter?.distancemin, 2),
          distMax: num(emitter?.distancemax, 10),
          velMin: parseVec3(vel?.min, [0, 0, -10]),
          velMax: parseVec3(vel?.max, [0, 0, -20]),
          colorMin: parseVec3(col?.min, [200, 200, 200]).map((c) => c / 255),
          colorMax: parseVec3(col?.max, [255, 255, 255]).map((c) => c / 255)
        });
      }
    }
    if (manifest.models.length > 0) {
      return manifest;
    }
  }
  for (const obj of scene.objects) {
    const nameLower = (typeof obj.name === "string" ? obj.name : "").toLowerCase();
    if (nameLower.includes("star") || nameLower.includes("meteor")) {
      manifest.hasMeteors = true;
    }
    if (nameLower.includes("fireflies") || nameLower.includes("motes") || nameLower.includes("dust")) {
      manifest.hasFireflies = true;
    }
  }
  const meteorTexPath = allTex.find((p) => p.toLowerCase().includes("shootingstar") || p.toLowerCase().includes("meteor"));
  if (meteorTexPath) manifest.meteorTex = resourceUrl(meteorTexPath);
  const sparkleTexPath = allTex.find((p) => p.toLowerCase().includes("sparkle") || p.toLowerCase().includes("halo") || p.toLowerCase().includes("star"));
  if (sparkleTexPath) manifest.sparkleTex = resourceUrl(sparkleTexPath);
  const sceneObjects = scene.objects;
  const resolveObjectTransform = (obj) => {
    const chain = [obj];
    let cur = obj;
    while (cur.parent != null && chain.length <= 32) {
      const parent = sceneObjects.find((o) => o.id === cur.parent);
      if (!parent || chain.includes(parent)) break;
      chain.push(parent);
      cur = parent;
    }
    const root = chain[chain.length - 1];
    let origin = parseVec3(root.origin, [width / 2, height / 2, 0]);
    let scale = parseVec3(root.scale, [1, 1, 1]);
    let angle = parseVec3(root.angles, [0, 0, 0])[2];
    for (let i = chain.length - 2; i >= 0; i--) {
      const localOrigin = parseVec3(chain[i].origin, [0, 0, 0]);
      const localScale = parseVec3(chain[i].scale, [1, 1, 1]);
      const localAngle = parseVec3(chain[i].angles, [0, 0, 0])[2];
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      origin = [
        origin[0] + localOrigin[0] * scale[0] * c - localOrigin[1] * scale[1] * s,
        origin[1] + localOrigin[0] * scale[0] * s + localOrigin[1] * scale[1] * c,
        origin[2] + localOrigin[2] * scale[2]
      ];
      scale = [scale[0] * localScale[0], scale[1] * localScale[1], scale[2] * localScale[2]];
      angle += localAngle;
    }
    return { origin, scale, angle };
  };
  const hasReflectionEffect = (obj) => (Array.isArray(obj.effects) ? obj.effects : []).some(
    (e) => typeof e?.file === "string" && e.file.toLowerCase().includes("effects/reflection")
  );
  for (const obj of sceneObjects) {
    if (!obj.image || typeof obj.image !== "string" || obj.image.startsWith("models/util/")) {
      if (typeof obj.name === "string" && obj.name.toLowerCase() === "reflection" || hasReflectionEffect(obj)) {
        const reflTex = allTex.find((p) => p.toLowerCase().includes("reflection_mask"));
        if (reflTex) {
          manifest.layers.push({
            name: "Reflection",
            isReflection: true,
            texUrl: resourceUrl(reflTex),
            x: width / 2,
            y: height / 2,
            w: width,
            h: height
          });
        }
      }
      continue;
    }
    if (obj.visible === false) continue;
    const nameLower = (typeof obj.name === "string" ? obj.name : "").toLowerCase();
    const isTimePeriodLayer = manifest.timeSchedule !== void 0 && timePeriods.has(nameLower);
    if (obj.visible && typeof obj.visible === "object" && obj.visible.value === false && !isTimePeriodLayer) continue;
    if (nameLower.includes("black") || nameLower.includes("len") || nameLower.includes("util") || nameLower.includes("flare") || nameLower.includes("blend") || nameLower === "sun" || nameLower === "sun2") {
      continue;
    }
    const modelJson = access.readJson(obj.image);
    if (!modelJson || typeof modelJson.material !== "string") continue;
    const matJson = access.readJson(modelJson.material);
    if (!matJson || !Array.isArray(matJson.passes)) continue;
    const pass0 = matJson.passes[0];
    const layerShader = typeof pass0?.shader === "string" ? pass0.shader : void 0;
    const texRefs = (Array.isArray(pass0?.textures) ? pass0.textures : []).map((t) => String(t)).filter((t) => !t.startsWith("_rt_"));
    if (texRefs.length === 0) continue;
    const texName = texRefs[0];
    if (layerShader !== "flowimage" && isLikelyMaskOrHelper(texName)) continue;
    const resolveLayerTex = (ref) => allTex.find(
      (p) => p.toLowerCase() === ref.toLowerCase() || p.toLowerCase() === ("materials/" + ref + ".tex").toLowerCase() || p.toLowerCase() === (ref + ".tex").toLowerCase() || p.toLowerCase().endsWith("/" + ref.toLowerCase() + ".tex") || p.toLowerCase().endsWith("/" + ref.toLowerCase())
    );
    const texPath = resolveLayerTex(texName);
    if (!texPath) continue;
    const file = access.readFile(texPath);
    if (!file) continue;
    const texPaths = texRefs.map((ref) => resolveLayerTex(ref)).filter((p) => Boolean(p));
    const nums = {};
    const csv = pass0?.constantshadervalues;
    if (csv) {
      for (const [k, v] of Object.entries(csv)) {
        if (typeof v === "number" && Number.isFinite(v)) nums[k] = v;
      }
    }
    let layerUserColors;
    const lusv = pass0?.usershadervalues;
    if (lusv) {
      for (const [key, uniformName] of Object.entries(lusv)) {
        if (typeof uniformName !== "string") continue;
        const pv = props?.[key]?.value;
        if (typeof pv === "string") {
          layerUserColors = layerUserColors ?? {};
          layerUserColors[uniformName] = parseVec3(pv, [1, 1, 1]);
        }
      }
    }
    let decoded = null;
    try {
      decoded = decodeTex(file.bytes);
    } catch {
      decoded = null;
    }
    const resolvedTransform = resolveObjectTransform(obj);
    const objOrigin = [...resolvedTransform.origin];
    const objScale = resolvedTransform.scale;
    const objAngles = [0, 0, resolvedTransform.angle];
    let lw = 0;
    let lh = 0;
    if (typeof modelJson.width === "number" && typeof modelJson.height === "number") {
      lw = modelJson.width;
      lh = modelJson.height;
    } else if (typeof obj.size === "string") {
      const parts = obj.size.trim().split(/\s+/).map(parseFloat);
      if (parts.length >= 2 && !parts.some(isNaN)) {
        lw = parts[0];
        lh = parts[1];
      }
    }
    if ((!lw || !lh) && decoded) {
      lw = decoded.width;
      lh = decoded.height;
    }
    if (!lw || !lh) continue;
    if (!decoded && !access.readFile(texPath)) continue;
    if (decoded && !modelJson.width && decoded.width < 64 && decoded.height < 64) continue;
    lw *= Math.abs(objScale[0]) || 1;
    lh *= Math.abs(objScale[1]) || 1;
    if (modelJson.fullscreen === true) {
      lw = width;
      lh = height;
      objOrigin[0] = width / 2;
      objOrigin[1] = height / 2;
      objAngles[2] = 0;
    }
    const alignment = typeof obj.alignment === "string" ? obj.alignment.toLowerCase() : "";
    let alignDx = 0;
    let alignDy = 0;
    if (alignment.includes("left")) alignDx = lw / 2;
    else if (alignment.includes("right")) alignDx = -lw / 2;
    if (alignment.includes("top")) alignDy = -lh / 2;
    else if (alignment.includes("bottom")) alignDy = lh / 2;
    let ox = 0;
    let oy = 0;
    if (typeof modelJson.cropoffset === "string") {
      const parts = modelJson.cropoffset.trim().split(/\s+/);
      ox = parseFloat(parts[0]) || 0;
      oy = parseFloat(parts[1]) || 0;
    }
    const alpha = typeof obj.alpha === "number" && Number.isFinite(obj.alpha) ? Math.min(1, Math.max(0, obj.alpha)) : 1;
    let videoUrl;
    try {
      if (parseTexInternal(file.bytes).isVideoMp4) videoUrl = resourceUrl(texPath);
    } catch {
    }
    let uvCrop;
    if (decoded && typeof modelJson.width === "number" && typeof modelJson.height === "number") {
      const u0 = ox / decoded.width;
      const u1 = (ox + modelJson.width) / decoded.width;
      const v0 = oy / decoded.height;
      const v1 = (oy + modelJson.height) / decoded.height;
      if (u0 !== 0 || v0 !== 0 || u1 < 0.999 || v1 < 0.999) {
        uvCrop = [u0, v0, u1, v1];
      }
    }
    const isGround = nameLower.includes("land") || nameLower.includes("grass") || nameLower.includes("railing") || nameLower.includes("betong") || nameLower.includes("sign") || nameLower.includes("cabinet") || nameLower.includes("bush") || nameLower.includes("fence");
    const layerX = objOrigin[0] + alignDx;
    const layerY = objOrigin[1] + alignDy;
    if (hasReflectionEffect(obj) || nameLower === "reflection") {
      const reflTex = allTex.find((p) => p.toLowerCase().includes("reflection_mask"));
      if (reflTex) {
        manifest.layers.push({
          name: "Reflection",
          isReflection: true,
          texUrl: resourceUrl(reflTex),
          x: layerX,
          y: layerY,
          w: lw,
          h: lh,
          waterLine: Math.min(1, Math.max(0, 1 - (layerY + lh / 2) / height))
        });
      }
    }
    manifest.layers.push({
      name: typeof obj.name === "string" ? obj.name : "layer",
      texUrl: resourceUrl(texPath),
      // cropoffset (ox/oy) only crops the sampled UV rect; it must not move
      // the quad in world space.
      x: layerX,
      y: layerY,
      w: lw,
      h: lh,
      alpha,
      angle: objAngles[2] || 0,
      uvCrop,
      shader: layerShader,
      texUrls: texPaths.length > 1 ? texPaths.map((p) => resourceUrl(p)) : void 0,
      userColors: layerUserColors,
      nums: Object.keys(nums).length > 0 ? nums : void 0,
      isGround,
      sway: 0,
      swaySpeed: 1.5,
      timePeriod: isTimePeriodLayer ? nameLower === "mddn" ? "manual" : nameLower : void 0,
      videoUrl
    });
  }
  if (manifest.layers.length === 0) return null;
  return manifest;
}
function extractSceneResourceVia(access, subpath) {
  const norm = subpath.replace(/\\/g, "/");
  const file = access.readFile(norm) || access.readFile("materials/" + norm) || access.readFile(norm + ".tex");
  if (!file) return null;
  try {
    const parsed = parseTexInternal(file.bytes);
    const mip0 = parsed.mipmaps[0];
    if (parsed.isVideoMp4) return embeddedMp4Bytes(file.bytes) ?? mip0.bytes;
    if (isPngBuffer(mip0.bytes)) {
      return Buffer2.from(mip0.bytes);
    }
    const dec = decodeTex(file.bytes);
    return Buffer2.from(encodePng(dec.width, dec.height, dec.rgba));
  } catch {
    return file.bytes;
  }
}
function buildSceneManifest(pkgData, token, project) {
  return buildSceneManifestVia(pkgSceneAccess(pkgData), token, project);
}
function extractSceneResource(pkgData, subpath) {
  return extractSceneResourceVia(pkgSceneAccess(pkgData), subpath);
}

// scripts/scene-helper-entry.js
var [command, pkgPath, projectPath, cacheDir] = process.argv.slice(2);
var RESOURCE_PREFIX = "/api/skin-center/we/scene-resource/local/";
function collectUrls(value, found = /* @__PURE__ */ new Set()) {
  if (typeof value === "string" && value.startsWith(RESOURCE_PREFIX)) found.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectUrls(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectUrls(item, found));
  return found;
}
function extension(bytes) {
  if (bytes.length > 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return ".png";
  if (bytes.length > 12 && bytes[4] === 102 && bytes[5] === 116 && bytes[6] === 121 && bytes[7] === 112) return ".mp4";
  return null;
}
function main() {
  if (!["probe", "prepare"].includes(command) || !pkgPath || !projectPath || command === "prepare" && !cacheDir) {
    throw new Error("usage: scene-helper <probe|prepare> <scene.pkg> <project.json> [cache-dir]");
  }
  const stat = fs.statSync(pkgPath);
  if (!stat.isFile() || stat.size > 512 * 1024 * 1024) throw new Error("scene package is unavailable or exceeds 512 MiB");
  const pkg = new Uint8Array(fs.readFileSync(pkgPath));
  const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
  let manifest = null;
  let frame = null;
  let video = null;
  const errors = [];
  try {
    manifest = buildSceneManifest(pkg, "local", project);
  } catch (error) {
    errors.push(`manifest: ${error.message}`);
  }
  try {
    frame = extractSceneMainImage(pkg);
  } catch (error) {
    errors.push(`frame: ${error.message}`);
  }
  if (!manifest?.layers?.length && !manifest?.models?.length) {
    try {
      video = extractSceneVideo(pkg);
    } catch (error) {
      errors.push(`video: ${error.message}`);
    }
  }
  const probe = {
    manifest: Boolean(manifest?.layers?.length || manifest?.models?.length),
    frame: Boolean(frame),
    video: Boolean(video),
    scripted: Boolean(manifest?.scripted),
    errors
  };
  if (command === "probe") {
    process.stdout.write(JSON.stringify(probe));
    return;
  }
  fs.mkdirSync(cacheDir, { recursive: true });
  const resources = {};
  const missing = [];
  if (manifest) {
    for (const url of collectUrls(manifest)) {
      const subpath = url.slice(RESOURCE_PREFIX.length).split("/").map(decodeURIComponent).join("/");
      try {
        const bytes = extractSceneResource(pkg, subpath);
        const ext = bytes && extension(bytes);
        if (!bytes || !ext) {
          missing.push(subpath);
          continue;
        }
        const name = createHash("sha256").update(subpath).digest("hex").slice(0, 24) + ext;
        const target = path.join(cacheDir, name);
        fs.writeFileSync(target, bytes);
        resources[url] = target;
      } catch (error) {
        missing.push(`${subpath}: ${error.message}`);
      }
    }
  }
  let framePath = null;
  if (frame) {
    framePath = path.join(cacheDir, "scene-frame.png");
    fs.writeFileSync(framePath, frame.png);
  }
  let videoPath = null;
  if (video) {
    videoPath = path.join(cacheDir, "scene-video.mp4");
    fs.writeFileSync(videoPath, video);
  }
  const result = {
    ...probe,
    manifest,
    resources,
    missing,
    framePath,
    videoPath,
    scenePath: pkgPath,
    projectPath
  };
  const temp = path.join(cacheDir, `manifest.json.tmp-${process.pid}`);
  fs.writeFileSync(temp, JSON.stringify(result), "utf8");
  fs.renameSync(temp, path.join(cacheDir, "manifest.json"));
  process.stdout.write(JSON.stringify({
    ...probe,
    resourceCount: Object.keys(resources).length,
    missingCount: missing.length,
    framePath,
    videoPath,
    manifestPath: path.join(cacheDir, "manifest.json")
  }));
}
try {
  main();
} catch (error) {
  process.stderr.write(String(error?.stack || error));
  process.exitCode = 1;
}
