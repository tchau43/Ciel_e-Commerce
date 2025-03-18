// Helper function to generate all possible combinations of a specific size
function generateCombinations(array, size) {
    const result = [];
    function backtrack(start, current) {
        if (current.length === size) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            current.push(array[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    backtrack(0, []);
    return result;
}

module.exports = { generateCombinations }