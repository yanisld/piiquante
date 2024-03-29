const Sauce = require("../models/Sauce");
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };

  exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  };

  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
      let likeCount = sauce.likes;
      let dislikeCount = sauce.dislikes;
      let usersId = sauce.usersLiked;
      let usersIdDisliked = sauce.usersDisliked;

      if (req.body.like == 1 && usersId.includes(req.body.userId) == false){
        likeCount++;
        usersId.push(req.body.userId);
        Sauce.updateOne({ _id: req.params.id }, { "$set": {likes:likeCount, usersLiked:usersId}})
        .then(() => res.status(200).json({ message: 'Likes mis à jour !'}))
        .catch(error => res.status(400).json({ error }));
      }
      else if (req.body.like == -1 && usersIdDisliked.includes(req.body.userId) == false) {
        dislikeCount++;
        usersIdDisliked.push(req.body.userId);
        Sauce.updateOne({ _id: req.params.id }, { "$set": {dislikes:dislikeCount, usersDisliked:usersIdDisliked}})
        .then(() => res.status(200).json({ message: 'Dislikes mis à jour !'}))
        .catch(error => res.status(400).json({ error }));
      }
      else {
        for (let i in usersId){
          if (req.body.userId == usersId[i]){
            likeCount--;
            usersId.splice(i, 1);
            Sauce.updateOne({ _id: req.params.id }, { "$set": {likes:likeCount, usersLiked:usersId}})
            .then(() => res.status(200).json({ message: 'Annulation Like'}))
            .catch(error => res.status(400).json({ error }));
          }
        }
        for (let j in usersIdDisliked){
          if (req.body.userId == usersIdDisliked[j]){
            dislikeCount--;
            usersIdDisliked.splice(j, 1);
            Sauce.updateOne({ _id: req.params.id }, { "$set": {dislikes:dislikeCount, usersDisliked:usersIdDisliked}})
            .then(() => res.status(200).json({ message: 'Annulation dislike'}))
            .catch(error => res.status(400).json({ error }));
          }
        }
      }
    })
    .catch(error => res.status(400).json({ error }));
}