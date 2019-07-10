var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Riwayat = require("../models/riwayat.model");
var Access = require("../models/access.model");
const socketApp = require('../socket/socket-app');
var ObjectId = require('mongoose').Types.ObjectId;
var Constants = require('../services/Constants');
var CryptoJS = require("crypto-js");
var admin = require("firebase-admin");
var serviceAccount = require("../pamedhisjav-firebase-adminsdk-1ma2u-282dd66033.json");
var apiPortal = require('../services/OutApi');
var axios = require('axios');

/**
 * initial FCM app
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pamedhisjav.firebaseio.com"
});
const servicesRiwayat = {
    getAllBlock: async () => {
        let block = await Riwayat.find()
        return block
    },
    calculateHash: function (index, previousHash, timestamp, data) {
        let hash = CryptoJS.SHA256(index + previousHash + timestamp + data);
        return hash
    },
    createGenesisBlock: function (waktu, data) {
        let addBlock = new Riwayat({
            index: 0,
            hash: servicesRiwayat.calculateHash(0, '0', waktu, data),
            previousHash: '0',
            timestamp: waktu,
            data: data
        })
        return addBlock;
    },
    updateHash: async (currentBlock) => {
        let updateBlock = await Riwayat.update({
            _id: currentBlock._id
        }, {
            $set: {
                // "hash" : "sdsadsads"
                "hash": servicesRiwayat.calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data).toString()
            }
        })
        return updateBlock
    },
    isValidNewBlock: function (currentBlock, previousBlock) {
        if (previousBlock.index + 1 !== currentBlock.index) {
            return false
        } else if (previousBlock.hash !== currentBlock.previousHash) {
            return false
        } else if ((currentBlock.hash).toString() !== servicesRiwayat.calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data).toString()) {
            return false
        }
        return true
    }

}

const riwayatRepositories = {
    cekDataNode: async (idUser, NIK) => {
        let result = await Access.find({ $and: [{ NIK: NIK }, { idUserPengakses: idUser }]})
        if (result.length > 0) {
            return true
        } else {
            /**
             * Push notif to FCM
             */
            var registrationToken = "fWis3b_5TBc:APA91bGbo3Rgom_KVynPjJuKTZsXSkEPz5DoAujhZRldQXdaVZu-pE3jXPLKfyZKlXwE1AKQ91QFsHHg5FeCXy3DPW6CJ1gLuIvNTfttCdEAC2bMVAC_g0W7XR6TDvEscCBHNObVYMQC"
            var payload = {
                notification: {
                    title: "Data access permission",
                    body: idUser
                }
            };

            var options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };
            admin.messaging().sendToDevice(registrationToken, payload, options)
                .then(function (response) {
                    console.log("Successfully sent message:", response);
                })
                .catch(function (error) {
                    console.log("Error sending message:", error);
                });

            return false
        }
    },
    cekHakAkses: async (idUser, NIK) => {
        let result = await Access.find({ $and: [{ NIK: NIK }, { idUserPengakses: idUser }]})
        if (result.length > 0) {
            return true
        } else {
            /**
             * Push notif to FCM
             */
            var registrationToken = "fWis3b_5TBc:APA91bGbo3Rgom_KVynPjJuKTZsXSkEPz5DoAujhZRldQXdaVZu-pE3jXPLKfyZKlXwE1AKQ91QFsHHg5FeCXy3DPW6CJ1gLuIvNTfttCdEAC2bMVAC_g0W7XR6TDvEscCBHNObVYMQC" 
            var payload = {
                notification: {
                    title: "Data access permission",
                    body: idUser
                }
            };

            var options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };
            admin.messaging().sendToDevice(registrationToken, payload, options)
                .then(function (response) {
                    console.log("Successfully sent message:", response);
                })
                .catch(function (error) {
                    console.log("Error sending message:", error);
                });

            return false
        }
    },
    giveAccesTo: async (idUserPengakses, NIK) => {
        let access = new Access({
            idUserPengakses: idUserPengakses,
            NIK: NIK
        })
        let result = await access.save()
        return result
    },


    createNextBlock: async (NIK , NO_KTP, TMP_SBL, NO_PASPOR, TGL_AKH_PASPOR, NAMA_LGKP, JENIS_KLMIN,TMPT_LHR, TGL_LHR, AKTA_LHR, NO_AKTA_LHR, GOL_DRH, AGAMA,STAT_KWN, AKTA_KWN, NO_AKTA_KWN, TGL_KWN, AKTA_CRAI, NO_AKTA_CRAI, TGL_CRAI, STAT_HBKEL, KLAIN_FSK, PNYDNG_CCT, PDDK_AKH, JENIS_PKRJN, NIK_IBU, NAMA_LGKP_IBU, NIK_AYAH, NAMA_LGKP_AYAH, NAMA_KET_RT, NAMA_KET_RW, NAMA_PET_REG, NIP_PET_REG, NAMA_PET_ENTRI, NIP_PET_ENTRI,  TGL_ENTRI, NO_KK , JENIS_BNTU, NO_PROP, NO_KAB, NO_KEC, NO_KEL, STAT_HIDUP, TGL_UBAH, TGL_CETAK_KTP, TGL_GANTI_KTP, TGL_PJG_KTP, STAT_KTP, ALS_NUMPANG, PFLAG, CFLAG, SYNC_FLAG, KET_AGAMA, KEBANGSAAN, GELAR, KET_PKRJN, GLR_AGAMA, GLR_AKADEMIS, GLR_BANGSAWAN, IS_PROS_DATANG, DESC_PEKERJAAN, DESC_KEPERCAYAAN, FLAG_STATUS, COUNT_KTP, COUNT_BIODATA, FLAG_EKTP, CURRENT_STATUS_CODE_EKTP, TGL_REPLIKSI, CREATED_BY, MODIFIED_BY, FLAG_PINDAH, EKTP_CURRENT_STATUS_CODE, EKTP_CREATED_DATE, EKTP_CREATED_BY, EKTP_UP_DATE, EKTP_UP_BY, EKTP_UPLOAD_LOCATION, EKTP_BATCH, SMS_PHONE, SMS_COUNT, FLAGSINK, SUMBER, NAMA_LGKP_EKTP, TMP_LHR_EKTP, JENIS_KLMIN_EKTP, TGL_LHR_EKTP, NAMA_PROP_EKTP, NAMA_KAB_EKTP, NAMA_KEC_EKTP, NAMA_KEL_EKTP, NO_PROP_EKTP, NO_KAB_EKTP, NO_KEC_EKTP, NO_KEL_EKTP, BID, EXP, TGL_CUT_OFF, SEP, NIK_EKTP, NO_KK_EKTP, NO_AKTA_LHR_EKTP, STAT_HBKL_EKTP, PDDK_AKH_EKTP, JENIS_PKRJN_EKTP, NAMA_LGKP_IBU_EKTP, NAMA_LGKP_AYAH_EKTP, TGL_ENTRI_EKTP, TGL_UBAH_EKTP, CREATED_EKTP, SKOR_NAMA, SKOR_TGL_LHR, SKOR_TMPT_LHR, SKOR_IBU, SKOR_AYAH, NO_PROP_O, NO_KAB_O, NO_KEC_O, NO_KEL_O, STATUS_KAWIN) => {
        let getPreviousBlock = await servicesRiwayat.getAllBlock()
        let waktu = new Date()
        let data = {
            NIK : NIK,
            NO_KTP : NO_KTP,
            TMP_SBL : TMP_SBL,
            NO_PASPOR : NO_PASPOR,
            TGL_AKH_PASPOR : TGL_AKH_PASPOR,
            NAMA_LGKP : NAMA_LGKP,
            JENIS_KLMIN : JENIS_KLMIN,
            TMPT_LHR : TMPT_LHR,
            TGL_LHR : TGL_LHR,
            AKTA_LHR : AKTA_LHR,
            NO_AKTA_LHR : NO_AKTA_LHR,
            GOL_DRH : GOL_DRH,
            AGAMA : AGAMA,
            STAT_KWN : STAT_KWN,
            AKTA_KWN : AKTA_KWN,
            NO_AKTA_KWN : NO_AKTA_KWN,
            TGL_KWN : TGL_KWN,
            AKTA_CRAI : AKTA_CRAI,
            NO_AKTA_CRAI : NO_AKTA_CRAI,
            TGL_CRAI : TGL_CRAI,
            STAT_HBKEL : STAT_HBKEL,
            KLAIN_FSK : KLAIN_FSK,
            PNYDNG_CCT : PNYDNG_CCT,
            PDDK_AKH : PDDK_AKH,
            JENIS_PKRJN : JENIS_PKRJN,
            NIK_IBU : NIK_IBU,
            NAMA_LGKP_IBU : NAMA_LGKP_IBU,
            NIK_AYAH : NIK_AYAH,
            NAMA_LGKP_AYAH : NAMA_LGKP_AYAH,
            NAMA_KET_RT : NAMA_KET_RT,
            NAMA_KET_RW : NAMA_KET_RW,
            NAMA_PET_REG : NAMA_PET_REG,
            NIP_PET_REG : NIP_PET_REG,
            NAMA_PET_ENTRI : NAMA_PET_ENTRI,
            NIP_PET_ENTRI : NIP_PET_ENTRI,
            TGL_ENTRI : TGL_ENTRI,
            NO_KK : NO_KK,
            JENIS_BNTU : JENIS_BNTU,
            NO_PROP : NO_PROP,
            NO_KAB : NO_KAB,
            NO_KEC : NO_KEC,
            NO_KEL : NO_KEL,
            STAT_HIDUP : STAT_HIDUP,
            TGL_UBAH : TGL_UBAH,
            TGL_CETAK_KTP : TGL_CETAK_KTP,
            TGL_GANTI_KTP : TGL_GANTI_KTP,
            TGL_PJG_KTP : TGL_PJG_KTP,
            STAT_KTP : STAT_KTP,
            ALS_NUMPANG : ALS_NUMPANG,
            PFLAG : PFLAG,
            CFLAG : CFLAG,
            SYNC_FLAG : SYNC_FLAG,
            KET_AGAMA : KET_AGAMA,
            KEBANGSAAN : KEBANGSAAN,
            GELAR : GELAR,
            KET_PKRJN : KET_PKRJN,
            GLR_AGAMA : KET_AGAMA,
            GLR_AKADEMIS : GLR_AKADEMIS,
            GLR_BANGSAWAN : GLR_BANGSAWAN,
            IS_PROS_DATANG : IS_PROS_DATANG,
            DESC_PEKERJAAN : DESC_PEKERJAAN,
            DESC_KEPERCAYAAN : DESC_KEPERCAYAAN,
            FLAG_STATUS : FLAG_STATUS,
            COUNT_KTP : COUNT_KTP,
            COUNT_BIODATA : COUNT_BIODATA,
            FLAG_EKTP : FLAG_EKTP,
            CURRENT_STATUS_CODE_EKTP : CURRENT_STATUS_CODE_EKTP,
            TGL_REPLIKSI : TGL_REPLIKSI,
            CREATED_BY : CREATED_BY,
            MODIFIED_BY : MODIFIED_BY,
            FLAG_PINDAH : FLAG_PINDAH,
            EKTP_CURRENT_STATUS_CODE : EKTP_CURRENT_STATUS_CODE,
            EKTP_CREATED_DATE : EKTP_CREATED_DATE,
            EKTP_CREATED_BY : EKTP_CREATED_BY,
            EKTP_UP_DATE : EKTP_UP_DATE,
            EKTP_UP_BY : EKTP_UP_BY,
            EKTP_UPLOAD_LOCATION : EKTP_UPLOAD_LOCATION,
            EKTP_BATCH : EKTP_BATCH,
            SMS_PHONE : SMS_PHONE,
            SMS_COUNT : SMS_COUNT,
            FLAGSINK : FLAGSINK,
            SUMBER : SUMBER,
            NAMA_LGKP_EKTP : NAMA_LGKP_EKTP,
            TMP_LHR_EKTP : TMP_LHR_EKTP,
            JENIS_KLMIN_EKTP : JENIS_KLMIN_EKTP,
            TGL_LHR_EKTP : TGL_LHR_EKTP,
            NAMA_PROP_EKTP : NAMA_PROP_EKTP,
            NAMA_KAB_EKTP : NAMA_KAB_EKTP,
            NAMA_KEC_EKTP : NAMA_KEC_EKTP,
            NAMA_KEL_EKTP : NAMA_KEL_EKTP,
            NO_PROP_EKTP : NO_PROP_EKTP,
            NO_KAB_EKTP : NO_KAB_EKTP,
            NO_KEC_EKTP : NO_KEC_EKTP,
            NO_KEL_EKTP : NO_KEL_EKTP,
            BID : BID,
            EXP : EXP,
            TGL_CUT_OFF : TGL_CUT_OFF,
            SEP : SEP,
            NIK_EKTP : NIK_EKTP,
            NO_KK_EKTP : NO_KK_EKTP,
            NO_AKTA_LHR_EKTP : NO_AKTA_LHR_EKTP,
            STAT_HBKL_EKTP : STAT_HBKL_EKTP,
            PDDK_AKH_EKTP : PDDK_AKH_EKTP,
            JENIS_PKRJN_EKTP : JENIS_PKRJN_EKTP,
            NAMA_LGKP_IBU_EKTP : NAMA_LGKP_IBU_EKTP,
            NAMA_LGKP_AYAH_EKTP : NAMA_LGKP_AYAH_EKTP,
            TGL_ENTRI_EKTP : TGL_ENTRI_EKTP,
            TGL_UBAH_EKTP : TGL_UBAH_EKTP,
            CREATED_EKTP : CREATED_EKTP,
            SKOR_NAMA : SKOR_NAMA,
            SKOR_TGL_LHR : SKOR_TGL_LHR,
            SKOR_TMPT_LHR : SKOR_TMPT_LHR,
            SKOR_IBU : SKOR_IBU,
            SKOR_AYAH : SKOR_AYAH,
            NO_PROP_O : NO_PROP_O,
            NO_KAB_O : NO_KAB_O,
            NO_KEC_O : NO_KEC_O,
            NO_KEL_O : NO_KEL_O,
            STATUS_KAWIN : STATUS_KAWIN
        }
        if (getPreviousBlock.length > 0) {
            let previousBlock = getPreviousBlock[getPreviousBlock.length - 1]
            // add new block
            var newBlock = {
                index: previousBlock.index + 1,
                hash: servicesRiwayat.calculateHash(previousBlock.index + 1, previousBlock.hash, waktu, data),
                previousHash: previousBlock.hash,
                timestamp: waktu,
                data: data
            };
            if (servicesRiwayat.isValidNewBlock(newBlock, previousBlock)) {
                let cekChain = await riwayatRepositories.isValidChain()
                if (!cekChain) {
                    //   jika tidak valid
                    return false
                } else {
                        let addBlock = new Riwayat({
                            index: newBlock.index,
                            hash: newBlock.hash,
                            previousHash: newBlock.previousHash,
                            timestamp: newBlock.timestamp,
                            data: newBlock.data
                        })
                        let pushBlock = await addBlock.save()
                        let updatedHash = await servicesRiwayat.updateHash(pushBlock)
                        return updatedHash
                }
            }
        } else {
            // create genesis block
            var newBlock = servicesRiwayat.createGenesisBlock(waktu, data)
            let pushBlock = await newBlock.save()
            let updatedHash = await servicesRiwayat.updateHash(pushBlock)
            return updatedHash

        }
    },
    cekNextBlock: async (NIK , NO_KTP, TMP_SBL, NO_PASPOR, TGL_AKH_PASPOR, NAMA_LGKP, JENIS_KLMIN,TMPT_LHR, TGL_LHR, AKTA_LHR, NO_AKTA_LHR, GOL_DRH, AGAMA,STAT_KWN, AKTA_KWN, NO_AKTA_KWN, TGL_KWN, AKTA_CRAI, NO_AKTA_CRAI, TGL_CRAI, STAT_HBKEL, KLAIN_FSK, PNYDNG_CCT, PDDK_AKH, JENIS_PKRJN, NIK_IBU, NAMA_LGKP_IBU, NIK_AYAH, NAMA_LGKP_AYAH, NAMA_KET_RT, NAMA_KET_RW, NAMA_PET_REG, NIP_PET_REG, NAMA_PET_ENTRI, NIP_PET_ENTRI,  TGL_ENTRI, NO_KK , JENIS_BNTU, NO_PROP, NO_KAB, NO_KEC, NO_KEL, STAT_HIDUP, TGL_UBAH, TGL_CETAK_KTP, TGL_GANTI_KTP, TGL_PJG_KTP, STAT_KTP, ALS_NUMPANG, PFLAG, CFLAG, SYNC_FLAG, KET_AGAMA, KEBANGSAAN, GELAR, KET_PKRJN, GLR_AGAMA, GLR_AKADEMIS, GLR_BANGSAWAN, IS_PROS_DATANG, DESC_PEKERJAAN, DESC_KEPERCAYAAN, FLAG_STATUS, COUNT_KTP, COUNT_BIODATA, FLAG_EKTP, CURRENT_STATUS_CODE_EKTP, TGL_REPLIKSI, CREATED_BY, MODIFIED_BY, FLAG_PINDAH, EKTP_CURRENT_STATUS_CODE, EKTP_CREATED_DATE, EKTP_CREATED_BY, EKTP_UP_DATE, EKTP_UP_BY, EKTP_UPLOAD_LOCATION, EKTP_BATCH, SMS_PHONE, SMS_COUNT, FLAGSINK, SUMBER, NAMA_LGKP_EKTP, TMP_LHR_EKTP, JENIS_KLMIN_EKTP, TGL_LHR_EKTP, NAMA_PROP_EKTP, NAMA_KAB_EKTP, NAMA_KEC_EKTP, NAMA_KEL_EKTP, NO_PROP_EKTP, NO_KAB_EKTP, NO_KEC_EKTP, NO_KEL_EKTP, BID, EXP, TGL_CUT_OFF, SEP, NIK_EKTP, NO_KK_EKTP, NO_AKTA_LHR_EKTP, STAT_HBKL_EKTP, PDDK_AKH_EKTP, JENIS_PKRJN_EKTP, NAMA_LGKP_IBU_EKTP, NAMA_LGKP_AYAH_EKTP, TGL_ENTRI_EKTP, TGL_UBAH_EKTP, CREATED_EKTP, SKOR_NAMA, SKOR_TGL_LHR, SKOR_TMPT_LHR, SKOR_IBU, SKOR_AYAH, NO_PROP_O, NO_KAB_O, NO_KEC_O, NO_KEL_O, STATUS_KAWIN) => {
        let getPreviousBlock = await servicesRiwayat.getAllBlock()
        let waktu = new Date()
        let data = {
            NIK : NIK,
            NO_KTP : NO_KTP,
            TMP_SBL : TMP_SBL,
            NO_PASPOR : NO_PASPOR,
            TGL_AKH_PASPOR : TGL_AKH_PASPOR,
            NAMA_LGKP : NAMA_LGKP,
            JENIS_KLMIN : JENIS_KLMIN,
            TMPT_LHR : TMPT_LHR,
            TGL_LHR : TGL_LHR,
            AKTA_LHR : AKTA_LHR,
            NO_AKTA_LHR : NO_AKTA_LHR,
            GOL_DRH : GOL_DRH,
            AGAMA : AGAMA,
            STAT_KWN : STAT_KWN,
            AKTA_KWN : AKTA_KWN,
            NO_AKTA_KWN : NO_AKTA_KWN,
            TGL_KWN : TGL_KWN,
            AKTA_CRAI : AKTA_CRAI,
            NO_AKTA_CRAI : NO_AKTA_CRAI,
            TGL_CRAI : TGL_CRAI,
            STAT_HBKEL : STAT_HBKEL,
            KLAIN_FSK : KLAIN_FSK,
            PNYDNG_CCT : PNYDNG_CCT,
            PDDK_AKH : PDDK_AKH,
            JENIS_PKRJN : JENIS_PKRJN,
            NIK_IBU : NIK_IBU,
            NAMA_LGKP_IBU : NAMA_LGKP_IBU,
            NIK_AYAH : NIK_AYAH,
            NAMA_LGKP_AYAH : NAMA_LGKP_AYAH,
            NAMA_KET_RT : NAMA_KET_RT,
            NAMA_KET_RW : NAMA_KET_RW,
            NAMA_PET_REG : NAMA_PET_REG,
            NIP_PET_REG : NIP_PET_REG,
            NAMA_PET_ENTRI : NAMA_PET_ENTRI,
            NIP_PET_ENTRI : NIP_PET_ENTRI,
            TGL_ENTRI : TGL_ENTRI,
            NO_KK : NO_KK,
            JENIS_BNTU : JENIS_BNTU,
            NO_PROP : NO_PROP,
            NO_KAB : NO_KAB,
            NO_KEC : NO_KEC,
            NO_KEL : NO_KEL,
            STAT_HIDUP : STAT_HIDUP,
            TGL_UBAH : TGL_UBAH,
            TGL_CETAK_KTP : TGL_CETAK_KTP,
            TGL_GANTI_KTP : TGL_GANTI_KTP,
            TGL_PJG_KTP : TGL_PJG_KTP,
            STAT_KTP : STAT_KTP,
            ALS_NUMPANG : ALS_NUMPANG,
            PFLAG : PFLAG,
            CFLAG : CFLAG,
            SYNC_FLAG : SYNC_FLAG,
            KET_AGAMA : KET_AGAMA,
            KEBANGSAAN : KEBANGSAAN,
            GELAR : GELAR,
            KET_PKRJN : KET_PKRJN,
            GLR_AGAMA : KET_AGAMA,
            GLR_AKADEMIS : GLR_AKADEMIS,
            GLR_BANGSAWAN : GLR_BANGSAWAN,
            IS_PROS_DATANG : IS_PROS_DATANG,
            DESC_PEKERJAAN : DESC_PEKERJAAN,
            DESC_KEPERCAYAAN : DESC_KEPERCAYAAN,
            FLAG_STATUS : FLAG_STATUS,
            COUNT_KTP : COUNT_KTP,
            COUNT_BIODATA : COUNT_BIODATA,
            FLAG_EKTP : FLAG_EKTP,
            CURRENT_STATUS_CODE_EKTP : CURRENT_STATUS_CODE_EKTP,
            TGL_REPLIKSI : TGL_REPLIKSI,
            CREATED_BY : CREATED_BY,
            MODIFIED_BY : MODIFIED_BY,
            FLAG_PINDAH : FLAG_PINDAH,
            EKTP_CURRENT_STATUS_CODE : EKTP_CURRENT_STATUS_CODE,
            EKTP_CREATED_DATE : EKTP_CREATED_DATE,
            EKTP_CREATED_BY : EKTP_CREATED_BY,
            EKTP_UP_DATE : EKTP_UP_DATE,
            EKTP_UP_BY : EKTP_UP_BY,
            EKTP_UPLOAD_LOCATION : EKTP_UPLOAD_LOCATION,
            EKTP_BATCH : EKTP_BATCH,
            SMS_PHONE : SMS_PHONE,
            SMS_COUNT : SMS_COUNT,
            FLAGSINK : FLAGSINK,
            SUMBER : SUMBER,
            NAMA_LGKP_EKTP : NAMA_LGKP_EKTP,
            TMP_LHR_EKTP : TMP_LHR_EKTP,
            JENIS_KLMIN_EKTP : JENIS_KLMIN_EKTP,
            TGL_LHR_EKTP : TGL_LHR_EKTP,
            NAMA_PROP_EKTP : NAMA_PROP_EKTP,
            NAMA_KAB_EKTP : NAMA_KAB_EKTP,
            NAMA_KEC_EKTP : NAMA_KEC_EKTP,
            NAMA_KEL_EKTP : NAMA_KEL_EKTP,
            NO_PROP_EKTP : NO_PROP_EKTP,
            NO_KAB_EKTP : NO_KAB_EKTP,
            NO_KEC_EKTP : NO_KEC_EKTP,
            NO_KEL_EKTP : NO_KEL_EKTP,
            BID : BID,
            EXP : EXP,
            TGL_CUT_OFF : TGL_CUT_OFF,
            SEP : SEP,
            NIK_EKTP : NIK_EKTP,
            NO_KK_EKTP : NO_KK_EKTP,
            NO_AKTA_LHR_EKTP : NO_AKTA_LHR_EKTP,
            STAT_HBKL_EKTP : STAT_HBKL_EKTP,
            PDDK_AKH_EKTP : PDDK_AKH_EKTP,
            JENIS_PKRJN_EKTP : JENIS_PKRJN_EKTP,
            NAMA_LGKP_IBU_EKTP : NAMA_LGKP_IBU_EKTP,
            NAMA_LGKP_AYAH_EKTP : NAMA_LGKP_AYAH_EKTP,
            TGL_ENTRI_EKTP : TGL_ENTRI_EKTP,
            TGL_UBAH_EKTP : TGL_UBAH_EKTP,
            CREATED_EKTP : CREATED_EKTP,
            SKOR_NAMA : SKOR_NAMA,
            SKOR_TGL_LHR : SKOR_TGL_LHR,
            SKOR_TMPT_LHR : SKOR_TMPT_LHR,
            SKOR_IBU : SKOR_IBU,
            SKOR_AYAH : SKOR_AYAH,
            NO_PROP_O : NO_PROP_O,
            NO_KAB_O : NO_KAB_O,
            NO_KEC_O : NO_KEC_O,
            NO_KEL_O : NO_KEL_O,
            STATUS_KAWIN : STATUS_KAWIN
        }
        if (getPreviousBlock.length > 0) {
            let previousBlock = getPreviousBlock[getPreviousBlock.length - 1]
            // add new block
            var newBlock = {
                index: previousBlock.index + 1,
                hash: servicesRiwayat.calculateHash(previousBlock.index + 1, previousBlock.hash, waktu, data),
                previousHash: previousBlock.hash,
                timestamp: waktu,
                data: data
            };
            if (servicesRiwayat.isValidNewBlock(newBlock, previousBlock)) {
                let cekChain = await riwayatRepositories.isValidChain()
                if (!cekChain) {
                    //   jika tidak valid
                    return false
                } else {
                    return true
                }
            }
        } else {
            return true

        }
    },
    sendData:async (NIK , NO_KTP, TMP_SBL, NO_PASPOR, TGL_AKH_PASPOR, NAMA_LGKP, JENIS_KLMIN,TMPT_LHR, TGL_LHR, AKTA_LHR, NO_AKTA_LHR, GOL_DRH, AGAMA,STAT_KWN, AKTA_KWN, NO_AKTA_KWN, TGL_KWN, AKTA_CRAI, NO_AKTA_CRAI, TGL_CRAI, STAT_HBKEL, KLAIN_FSK, PNYDNG_CCT, PDDK_AKH, JENIS_PKRJN, NIK_IBU, NAMA_LGKP_IBU, NIK_AYAH, NAMA_LGKP_AYAH, NAMA_KET_RT, NAMA_KET_RW, NAMA_PET_REG, NIP_PET_REG, NAMA_PET_ENTRI, NIP_PET_ENTRI,  TGL_ENTRI, NO_KK , JENIS_BNTU, NO_PROP, NO_KAB, NO_KEC, NO_KEL, STAT_HIDUP, TGL_UBAH, TGL_CETAK_KTP, TGL_GANTI_KTP, TGL_PJG_KTP, STAT_KTP, ALS_NUMPANG, PFLAG, CFLAG, SYNC_FLAG, KET_AGAMA, KEBANGSAAN, GELAR, KET_PKRJN, GLR_AGAMA, GLR_AKADEMIS, GLR_BANGSAWAN, IS_PROS_DATANG, DESC_PEKERJAAN, DESC_KEPERCAYAAN, FLAG_STATUS, COUNT_KTP, COUNT_BIODATA, FLAG_EKTP, CURRENT_STATUS_CODE_EKTP, TGL_REPLIKSI, CREATED_BY, MODIFIED_BY, FLAG_PINDAH, EKTP_CURRENT_STATUS_CODE, EKTP_CREATED_DATE, EKTP_CREATED_BY, EKTP_UP_DATE, EKTP_UP_BY, EKTP_UPLOAD_LOCATION, EKTP_BATCH, SMS_PHONE, SMS_COUNT, FLAGSINK, SUMBER, NAMA_LGKP_EKTP, TMP_LHR_EKTP, JENIS_KLMIN_EKTP, TGL_LHR_EKTP, NAMA_PROP_EKTP, NAMA_KAB_EKTP, NAMA_KEC_EKTP, NAMA_KEL_EKTP, NO_PROP_EKTP, NO_KAB_EKTP, NO_KEC_EKTP, NO_KEL_EKTP, BID, EXP, TGL_CUT_OFF, SEP, NIK_EKTP, NO_KK_EKTP, NO_AKTA_LHR_EKTP, STAT_HBKL_EKTP, PDDK_AKH_EKTP, JENIS_PKRJN_EKTP, NAMA_LGKP_IBU_EKTP, NAMA_LGKP_AYAH_EKTP, TGL_ENTRI_EKTP, TGL_UBAH_EKTP, CREATED_EKTP, SKOR_NAMA, SKOR_TGL_LHR, SKOR_TMPT_LHR, SKOR_IBU, SKOR_AYAH, NO_PROP_O, NO_KAB_O, NO_KEC_O, NO_KEL_O, STATUS_KAWIN)=>{
        var data = {
            ['NIK'] : NIK,
            ['NO_KTP'] : NO_KTP,
            ['TMP_SBL']: TMP_SBL,
            ['NO_PASPOR']: NO_PASPOR,
            ['TGL_AKH_PASPOR'] : TGL_AKH_PASPOR,
            ['NAMA_LGKP'] : NAMA_LGKP,
            ['JENIS_KLMIN'] : JENIS_KLMIN,
            ['TMPT_LHR'] : TMPT_LHR,
            ['TGL_LHR'] : TGL_LHR,
            ['AKTA_LHR'] : AKTA_LHR,
            ['NO_AKTA_LHR'] : NO_AKTA_LHR,
            ['GOL_DRH'] : GOL_DRH,
            ['AGAMA'] : AGAMA,
            ['STAT_KWN'] : STAT_KWN,
            ['AKTA_KWN'] : AKTA_KWN,
            ['NO_AKTA_KWN'] : NO_AKTA_KWN,
            ['TGL_KWN'] : TGL_KWN,
            ['AKTA_CRAI'] : AKTA_CRAI,
            ['NO_AKTA_CRAI'] : NO_AKTA_CRAI,
            ['TGL_CRAI'] : TGL_CRAI,
            ['STAT_HBKEL'] : STAT_HBKEL,
            ['KLAIN_FSK'] : KLAIN_FSK,
            ['PNYDNG_CCT'] : PNYDNG_CCT,
            ['PDDK_AKH'] : PDDK_AKH,
            ['JENIS_PKRJN'] : JENIS_PKRJN,
            ['NIK_IBU'] : NIK_IBU,
            ['NAMA_LGKP_IBU'] : NAMA_LGKP_IBU,
            ['NIK_AYAH'] : NIK_AYAH,
            ['NAMA_LGKP_AYAH'] : NAMA_LGKP_AYAH,
            ['NAMA_KET_RT'] : NAMA_KET_RT,
            ['NAMA_KET_RW']: NAMA_KET_RW,
            ['NAMA_PET_REG'] : NAMA_PET_REG,
            ['NIP_PET_REG'] : NIP_PET_REG,
            ['NAMA_PET_ENTRI'] : NAMA_PET_ENTRI,
            ['NIP_PET_ENTRI'] : NIP_PET_ENTRI,
            ['TGL_ENTRI'] : TGL_ENTRI,
            ['NO_KK'] : NO_KK,
            ['JENIS_BNTU'] : JENIS_BNTU,
            ['NO_PROP'] : NO_PROP,
            ['NO_KAB'] : NO_KAB,
            ['NO_KEC'] : NO_KEC,
            ['NO_KEL'] : NO_KEL,
            ['STAT_HIDUP'] : STAT_HIDUP,
            ['TGL_UBAH'] : TGL_UBAH,
            ['TGL_CETAK_KTP'] : TGL_CETAK_KTP,
            ['TGL_GANTI_KTP'] : TGL_GANTI_KTP,
            ['TGL_PJG_KTP'] : TGL_PJG_KTP,
            ['STAT_KTP'] : STAT_KTP,
            ['ALS_NUMPANG'] : ALS_NUMPANG,
            ['PFLAG'] : PFLAG,
            ['CFLAG'] : CFLAG,
            ['SYNC_FLAG'] : SYNC_FLAG,
            ['KET_AGAMA'] : KET_AGAMA,
            ['KEBANGSAAN'] : KEBANGSAAN,
            ['GELAR'] : GELAR,
            ['KET_PKRJN'] : KET_PKRJN,
            ['GLR_AGAMA'] : KET_AGAMA,
            ['GLR_AKADEMIS'] : GLR_AKADEMIS,
            ['GLR_BANGSAWAN'] : GLR_BANGSAWAN,
            ['IS_PROS_DATANG'] : IS_PROS_DATANG,
            ['DESC_PEKERJAAN'] : DESC_PEKERJAAN,
            ['DESC_KEPERCAYAAN'] : DESC_KEPERCAYAAN,
            ['FLAG_STATUS'] : FLAG_STATUS,
            ['COUNT_KTP'] : COUNT_KTP,
            ['COUNT_BIODATA'] : COUNT_BIODATA,
            ['FLAG_EKTP'] : FLAG_EKTP,
            ['CURRENT_STATUS_CODE_EKTP'] : CURRENT_STATUS_CODE_EKTP,
            ['TGL_REPLIKSI'] : TGL_REPLIKSI,
            ['CREATED_BY'] : CREATED_BY,
            ['MODIFIED_BY'] : MODIFIED_BY,
            ['FLAG_PINDAH'] : FLAG_PINDAH,
            ['EKTP_CURRENT_STATUS_CODE'] : EKTP_CURRENT_STATUS_CODE,
            ['EKTP_CREATED_DATE'] : EKTP_CREATED_DATE,
            ['EKTP_CREATED_BY'] : EKTP_CREATED_BY,
            ['EKTP_UP_DATE'] : EKTP_UP_DATE,
            ['EKTP_UP_BY'] : EKTP_UP_BY,
            ['EKTP_UPLOAD_LOCATION'] : EKTP_UPLOAD_LOCATION,
            ['EKTP_BATCH'] : EKTP_BATCH,
            ['SMS_PHONE'] : SMS_PHONE,
            ['SMS_COUNT'] : SMS_COUNT,
            ['FLAGSINK'] : FLAGSINK,
            ['SUMBER'] : SUMBER,
            ['NAMA_LGKP_EKTP'] : NAMA_LGKP_EKTP,
            ['TMP_LHR_EKTP'] : TMP_LHR_EKTP,
            ['JENIS_KLMIN_EKTP'] : JENIS_KLMIN_EKTP,
            ['TGL_LHR_EKTP'] : TGL_LHR_EKTP,
            ['NAMA_PROP_EKTP'] : NAMA_PROP_EKTP,
            ['NAMA_KAB_EKTP'] : NAMA_KAB_EKTP,
            ['NAMA_KEC_EKTP'] : NAMA_KEC_EKTP,
            ['NAMA_KEL_EKTP'] : NAMA_KEL_EKTP,
            ['NO_PROP_EKTP'] : NO_PROP_EKTP,
            ['NO_KAB_EKTP'] : NO_KAB_EKTP,
            ['NO_KEC_EKTP'] : NO_KEC_EKTP,
            ['NO_KEL_EKTP'] : NO_KEL_EKTP,
            ['BID'] : BID,
            ['EXP'] : EXP,
            ['TGL_CUT_OFF'] : TGL_CUT_OFF,
            ['SEP'] : SEP,
            ['NIK_EKTP'] : NIK_EKTP,
            ['NO_KK_EKTP'] : NO_KK_EKTP,
            ['NO_AKTA_LHR_EKTP'] : NO_AKTA_LHR_EKTP,
            ['STAT_HBKL_EKTP'] : STAT_HBKL_EKTP,
            ['PDDK_AKH_EKTP'] : PDDK_AKH_EKTP,
            ['JENIS_PKRJN_EKTP'] : JENIS_PKRJN_EKTP,
            ['NAMA_LGKP_IBU_EKTP'] : NAMA_LGKP_IBU_EKTP,
            ['NAMA_LGKP_AYAH_EKTP']: NAMA_LGKP_AYAH_EKTP,
            ['TGL_ENTRI_EKTP'] : TGL_ENTRI_EKTP,
            ['TGL_UBAH_EKTP'] : TGL_UBAH_EKTP,
            ['CREATED_EKTP'] : CREATED_EKTP,
            ['SKOR_NAMA'] : SKOR_NAMA,
            ['SKOR_TGL_LHR'] : SKOR_TGL_LHR,
            ['SKOR_TMPT_LHR'] : SKOR_TMPT_LHR,
            ['SKOR_IBU'] : SKOR_IBU,
            ['SKOR_AYAH'] : SKOR_AYAH,
            ['NO_PROP_O'] : NO_PROP_O,
            ['NO_KAB_O'] : NO_KAB_O,
            ['NO_KEC_O'] : NO_KEC_O,
            ['NO_KEL_O'] : NO_KEL_O,
            ['STATUS_KAWIN'] : STATUS_KAWIN
        }
        axios.post('http://localhost:3023/api/node3/add',data)
            .then(res => console.log(res))
    },
    isValidChain: async () => {
        let allBlock = await servicesRiwayat.getAllBlock()
        let bool = true
        for (let i = 1; i < allBlock.length; i++) {
            if (!servicesRiwayat.isValidNewBlock(allBlock[i], allBlock[i - 1])) {
                bool = false
            }
        }
        return bool
    },
    getChainById: async (NIK) => {
        let cekChain = await riwayatRepositories.isValidChain()
        if (!cekChain) {
            //   jika tidak valid
            return false
        } else {
            let chainById = await Riwayat.aggregate(
                [{
                    '$match': {
                        'data.NIK': new ObjectId(NIK)
                    }
                }, {
                    '$lookup': {
                        'from': 'dokters',
                        'localField': 'data.idDokter',
                        'foreignField': '_id',
                        'as': 'dokter_docs'
                    }
                }]
            )
            return chainById
        }
    },
    getPasienByDokter: async (idDokter) => {
        let result = await Riwayat.aggregate(
            [{
                '$match': {
                    'data.idDokter': new ObjectId(idDokter)
                }
            }, {
                '$group': {
                    '_id': '$data.idPasien',
                    'total': {
                        '$sum': 1
                    }
                }
            }, {
                '$lookup': {
                    'from': 'pasiens',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }]
        )
        if (result) {
            return result
        } else {
            return false
        }
    }



}

module.exports = riwayatRepositories