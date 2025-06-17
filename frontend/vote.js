function main() {
  console.log("Script loaded successfully.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}