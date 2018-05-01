module.exports = function CivilDis(){
  const Decimal = require('decimal');
  let cdis = {};
  
  let random = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  cdis.randomAmount = function(runningTotal, pot, number){
    let dollars = 0;
    let cents = 0;

    let hasAttempt = function(){
      return (dollars === 0 && cents === 0);
    };

    let isOverflow = function(){
      let temp = Decimal(dollars).add(Decimal(cents).mul(0.01));
      return temp > pot.toNumber();
    };

    while(isOverflow() || hasAttempt()){
      let dollarMax = 0;
      let diff = pot.sub(runningTotal).toNumber();
      if(diff > 0){
        dollarMax = diff / number;
      }
      dollars = random(0, dollarMax);
      cents = random(0, 99);
    }

    return Decimal(dollars).add(Decimal(cents).mul(0.01));
  };

  cdis.routine = function(pot, number){
    pot = Decimal(pot);
    number = parseInt(number);
    let items = [];
    let runningTotal = Decimal('0.0');
    
    for(let i = 0; i < number; i++){
      let item = {index: i, amount: cdis.randomAmount(runningTotal, pot, number)};
      runningTotal = runningTotal.add(item.amount);
      items.push(item);
    }

    while(pot.sub(runningTotal).toNumber() !== 0) {
      let diff = pot.sub(runningTotal);
      let rAmount = cdis.randomAmount(0, diff, 1);
      let rIndex = random(0, number - 1);
      items[rIndex].amount = items[rIndex].amount.add(rAmount);
      runningTotal = runningTotal.add(rAmount);
    }

    for(let i = 0; i < number; i++){
      let item = items[i];
      items[i].amount = item.amount.toNumber();
    }

    return items;
  };

  cdis.test = function(items, pot){
    let total = Decimal(0);
    for(let itemIndex in items){
      let item = items[itemIndex];
      total = total.add(item.amount);
    }
    return total.toNumber() === pot;
  };

  cdis.split = function(args, callback){
    let items = cdis.routine(args.amt, args.num);
    //cli.log(items);
    let success = cdis.test(items, args.amt);
    cli.log(success);
    callback();
  };

  let cli = require('vorpal')();
  cli.delimiter("cdis$").show();

  cli
    .command("split <amt> <num>")
    .action(cdis.split);

  let init = function(){
    return cdis;
  };

  return init();
}();